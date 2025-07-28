-- Function to generate employer invoices with patient aggregation
CREATE OR REPLACE FUNCTION generate_employer_invoice(
  p_employer_id UUID,
  p_start_date DATE,
  p_end_date DATE,
  p_due_date DATE DEFAULT (CURRENT_DATE + INTERVAL '30 days')
)
RETURNS UUID AS $$
DECLARE
  v_invoice_id UUID;
  v_invoice_number TEXT;
  v_total_amount NUMERIC(10,2) := 0;
  v_employer_name TEXT;
  v_line_items JSONB := '[]'::JSONB;
  v_patient_count INT := 0;
BEGIN
  -- Get employer details
  SELECT name INTO v_employer_name
  FROM employers
  WHERE id = p_employer_id;

  IF v_employer_name IS NULL THEN
    RAISE EXCEPTION 'Employer not found';
  END IF;

  -- Generate invoice number
  v_invoice_number := 'INV-' || p_employer_id::TEXT || '-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD');

  -- Create the invoice
  INSERT INTO invoices (
    invoice_number,
    employer_id,
    issue_date,
    due_date,
    status,
    items,
    total_amount,
    notes
  ) VALUES (
    v_invoice_number,
    p_employer_id,
    CURRENT_DATE,
    p_due_date,
    'pending',
    '[]'::JSONB,
    0,
    'Generated for period: ' || p_start_date || ' to ' || p_end_date
  ) RETURNING id INTO v_invoice_id;

  -- Aggregate charges by patient
  WITH patient_charges AS (
    -- Get all charges for active employer patients in the date range
    SELECT 
      ac.patient_id,
      p.raw_user_meta_data->>'name' as patient_name,
      ep.employee_id,
      ep.department,
      COUNT(DISTINCT ac.appointment_id) as appointment_count,
      SUM(ac.amount) as total_amount,
      ARRAY_AGG(
        JSONB_BUILD_OBJECT(
          'appointment_id', ac.appointment_id,
          'service_date', ac.service_date,
          'description', ac.description,
          'amount', ac.amount,
          'provider_name', pr.raw_user_meta_data->>'name'
        ) ORDER BY ac.service_date
      ) as appointments
    FROM appointment_charges ac
    JOIN employer_patients ep ON ac.patient_id = ep.patient_id
    JOIN auth.users p ON ac.patient_id = p.id
    LEFT JOIN appointments a ON ac.appointment_id = a.id
    LEFT JOIN auth.users pr ON a.provider_id = pr.id
    WHERE ep.employer_id = p_employer_id
      AND ep.is_active = true
      AND ac.service_date BETWEEN p_start_date AND p_end_date
      AND ac.status = 'pending'
    GROUP BY ac.patient_id, p.raw_user_meta_data->>'name', ep.employee_id, ep.department
  )
  -- Build line items and calculate total
  SELECT 
    COUNT(*),
    COALESCE(SUM(total_amount), 0),
    JSONB_AGG(
      JSONB_BUILD_OBJECT(
        'patient_id', patient_id,
        'patient_name', patient_name,
        'employee_id', employee_id,
        'department', department,
        'appointment_count', appointment_count,
        'amount', total_amount,
        'appointments', appointments
      ) ORDER BY patient_name
    )
  INTO v_patient_count, v_total_amount, v_line_items
  FROM patient_charges;

  -- Update invoice with aggregated data
  UPDATE invoices
  SET 
    items = v_line_items,
    total_amount = v_total_amount,
    metadata = JSONB_BUILD_OBJECT(
      'employer_name', v_employer_name,
      'patient_count', v_patient_count,
      'period_start', p_start_date,
      'period_end', p_end_date,
      'generated_at', NOW()
    )
  WHERE id = v_invoice_id;

  -- Mark the included appointment charges as invoiced
  UPDATE appointment_charges ac
  SET 
    status = 'invoiced',
    invoice_id = v_invoice_id,
    updated_at = NOW()
  FROM employer_patients ep
  WHERE ac.patient_id = ep.patient_id
    AND ep.employer_id = p_employer_id
    AND ep.is_active = true
    AND ac.service_date BETWEEN p_start_date AND p_end_date
    AND ac.status = 'pending';

  RETURN v_invoice_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate monthly employer invoices for all employers
CREATE OR REPLACE FUNCTION generate_monthly_employer_invoices(
  p_month DATE DEFAULT DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')
)
RETURNS TABLE(
  employer_id UUID,
  employer_name TEXT,
  invoice_id UUID,
  total_amount NUMERIC,
  patient_count INT
) AS $$
DECLARE
  v_start_date DATE;
  v_end_date DATE;
BEGIN
  -- Calculate date range for the month
  v_start_date := DATE_TRUNC('month', p_month);
  v_end_date := (v_start_date + INTERVAL '1 month - 1 day')::DATE;

  -- Generate invoices for all active employers with pending charges
  RETURN QUERY
  WITH employers_with_charges AS (
    SELECT DISTINCT e.id, e.name
    FROM employers e
    JOIN employer_patients ep ON e.id = ep.employer_id
    JOIN appointment_charges ac ON ep.patient_id = ac.patient_id
    WHERE e.is_active = true
      AND ep.is_active = true
      AND ac.status = 'pending'
      AND ac.service_date BETWEEN v_start_date AND v_end_date
  )
  SELECT 
    e.id as employer_id,
    e.name as employer_name,
    generate_employer_invoice(e.id, v_start_date, v_end_date) as invoice_id,
    i.total_amount,
    (i.metadata->>'patient_count')::INT as patient_count
  FROM employers_with_charges e
  JOIN invoices i ON i.id = generate_employer_invoice(e.id, v_start_date, v_end_date);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View for employer invoice details with patient breakdown
CREATE OR REPLACE VIEW employer_invoice_details AS
SELECT 
  i.id as invoice_id,
  i.invoice_number,
  i.issue_date,
  i.due_date,
  i.status,
  i.total_amount,
  e.id as employer_id,
  e.name as employer_name,
  e.contact_email,
  i.metadata->>'patient_count' as patient_count,
  i.metadata->>'period_start' as period_start,
  i.metadata->>'period_end' as period_end,
  JSONB_ARRAY_ELEMENTS(i.items) as patient_detail
FROM invoices i
JOIN employers e ON i.employer_id = e.id
WHERE i.employer_id IS NOT NULL;

-- View for patient-level invoice breakdown
CREATE OR REPLACE VIEW employer_invoice_patient_breakdown AS
SELECT 
  invoice_id,
  invoice_number,
  employer_id,
  employer_name,
  patient_detail->>'patient_id' as patient_id,
  patient_detail->>'patient_name' as patient_name,
  patient_detail->>'employee_id' as employee_id,
  patient_detail->>'department' as department,
  (patient_detail->>'appointment_count')::INT as appointment_count,
  (patient_detail->>'amount')::NUMERIC as amount,
  patient_detail->'appointments' as appointments
FROM employer_invoice_details;

-- Function to get employer invoice summary by date range
CREATE OR REPLACE FUNCTION get_employer_invoice_summary(
  p_employer_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE(
  total_invoices INT,
  total_amount NUMERIC,
  paid_amount NUMERIC,
  pending_amount NUMERIC,
  patient_count INT,
  appointment_count INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT i.id)::INT as total_invoices,
    COALESCE(SUM(i.total_amount), 0) as total_amount,
    COALESCE(SUM(CASE WHEN i.status = 'paid' THEN i.total_amount ELSE 0 END), 0) as paid_amount,
    COALESCE(SUM(CASE WHEN i.status = 'pending' THEN i.total_amount ELSE 0 END), 0) as pending_amount,
    COUNT(DISTINCT ac.patient_id)::INT as patient_count,
    COUNT(DISTINCT ac.appointment_id)::INT as appointment_count
  FROM invoices i
  LEFT JOIN appointment_charges ac ON ac.invoice_id = i.id
  WHERE i.employer_id = p_employer_id
    AND i.issue_date BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_appointment_charges_invoice_id ON appointment_charges(invoice_id);
CREATE INDEX IF NOT EXISTS idx_appointment_charges_patient_service ON appointment_charges(patient_id, service_date);
CREATE INDEX IF NOT EXISTS idx_invoices_employer_date ON invoices(employer_id, issue_date);

-- Grant permissions
GRANT EXECUTE ON FUNCTION generate_employer_invoice TO authenticated;
GRANT EXECUTE ON FUNCTION generate_monthly_employer_invoices TO authenticated;
GRANT EXECUTE ON FUNCTION get_employer_invoice_summary TO authenticated;
GRANT SELECT ON employer_invoice_details TO authenticated;
GRANT SELECT ON employer_invoice_patient_breakdown TO authenticated;

-- Sample usage (commented out)
/*
-- Generate invoice for a specific employer for last month
SELECT generate_employer_invoice(
  'employer-uuid-here',
  DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::DATE,
  (DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 day')::DATE
);

-- Generate all monthly invoices
SELECT * FROM generate_monthly_employer_invoices();

-- View employer invoice details
SELECT * FROM employer_invoice_details WHERE employer_id = 'employer-uuid-here';

-- View patient breakdown for an invoice
SELECT * FROM employer_invoice_patient_breakdown WHERE invoice_id = 'invoice-uuid-here';
*/