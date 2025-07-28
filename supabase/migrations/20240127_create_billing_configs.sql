-- Create billing configurations table for employer-specific pricing
CREATE TABLE billing_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID REFERENCES employers(id) UNIQUE,
  base_rate_per_employee DECIMAL(10,2),
  base_rate_per_family_member DECIMAL(10,2),
  visit_included_per_user INTEGER DEFAULT 0,
  visit_price DECIMAL(10,2),
  billing_frequency TEXT CHECK (billing_frequency IN ('monthly', 'quarterly')) DEFAULT 'monthly',
  grace_period_days INTEGER DEFAULT 0,
  allow_family_members BOOLEAN DEFAULT true,
  max_family_members_per_account INTEGER DEFAULT 5,
  subscription_type TEXT CHECK (subscription_type IN ('employer', 'direct')) DEFAULT 'employer',
  custom_plan_name TEXT,
  custom_notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for billing configs
CREATE INDEX idx_billing_configs_employer_id ON billing_configs(employer_id);
CREATE INDEX idx_billing_configs_is_active ON billing_configs(is_active);

-- Create family members table to track dependents
CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT CHECK (relationship IN ('spouse', 'child', 'parent', 'other')),
  date_of_birth DATE,
  email TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for family members
CREATE INDEX idx_family_members_primary_patient ON family_members(primary_patient_id);
CREATE INDEX idx_family_members_is_active ON family_members(is_active);

-- Create billing periods table to track billing cycles
CREATE TABLE billing_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID REFERENCES employers(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status TEXT CHECK (status IN ('draft', 'finalized', 'invoiced', 'paid')) DEFAULT 'draft',
  employee_count INTEGER DEFAULT 0,
  family_member_count INTEGER DEFAULT 0,
  total_visits INTEGER DEFAULT 0,
  billable_visits INTEGER DEFAULT 0,
  base_charges DECIMAL(10,2) DEFAULT 0,
  visit_charges DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) DEFAULT 0,
  invoice_id UUID REFERENCES invoices(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique billing periods per employer
  UNIQUE(employer_id, period_start, period_end)
);

-- Create indexes for billing periods
CREATE INDEX idx_billing_periods_employer_id ON billing_periods(employer_id);
CREATE INDEX idx_billing_periods_dates ON billing_periods(period_start, period_end);
CREATE INDEX idx_billing_periods_status ON billing_periods(status);

-- Enable RLS
ALTER TABLE billing_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_periods ENABLE ROW LEVEL SECURITY;

-- RLS Policies for billing_configs
CREATE POLICY "Owners can manage all billing configs"
  ON billing_configs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'owner'
    )
  );

CREATE POLICY "Admins can view billing configs"
  ON billing_configs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- RLS Policies for family_members
CREATE POLICY "Patients can manage their family members"
  ON family_members FOR ALL
  USING (auth.uid() = primary_patient_id);

CREATE POLICY "Providers can view family members of their patients"
  ON family_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM appointments a
      WHERE a.provider_id = auth.uid() 
      AND a.patient_id = family_members.primary_patient_id
    )
  );

-- RLS Policies for billing_periods
CREATE POLICY "Owners can manage all billing periods"
  ON billing_periods FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'owner'
    )
  );

-- Triggers for updated_at
CREATE TRIGGER update_billing_configs_updated_at
  BEFORE UPDATE ON billing_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_family_members_updated_at
  BEFORE UPDATE ON family_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_billing_periods_updated_at
  BEFORE UPDATE ON billing_periods
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate billing for a period
CREATE OR REPLACE FUNCTION calculate_billing_period(
  p_employer_id UUID,
  p_period_start DATE,
  p_period_end DATE
)
RETURNS billing_periods AS $$
DECLARE
  v_config billing_configs;
  v_period billing_periods;
  v_employee_count INTEGER;
  v_family_count INTEGER;
  v_total_visits INTEGER;
  v_billable_visits INTEGER;
  v_base_charges DECIMAL(10,2) := 0;
  v_visit_charges DECIMAL(10,2) := 0;
BEGIN
  -- Get billing config
  SELECT * INTO v_config
  FROM billing_configs
  WHERE employer_id = p_employer_id AND is_active = true;

  IF v_config IS NULL THEN
    RAISE EXCEPTION 'No active billing configuration found for employer';
  END IF;

  -- Count active employees
  SELECT COUNT(DISTINCT patient_id) INTO v_employee_count
  FROM employer_patients
  WHERE employer_id = p_employer_id
    AND is_active = true
    AND start_date <= p_period_end
    AND (end_date IS NULL OR end_date >= p_period_start);

  -- Count family members if allowed
  IF v_config.allow_family_members THEN
    SELECT COUNT(*) INTO v_family_count
    FROM family_members fm
    JOIN employer_patients ep ON fm.primary_patient_id = ep.patient_id
    WHERE ep.employer_id = p_employer_id
      AND fm.is_active = true
      AND ep.is_active = true;
  ELSE
    v_family_count := 0;
  END IF;

  -- Count total visits in period
  SELECT COUNT(*) INTO v_total_visits
  FROM appointments a
  JOIN employer_patients ep ON a.patient_id = ep.patient_id
  WHERE ep.employer_id = p_employer_id
    AND a.appointment_date BETWEEN p_period_start AND p_period_end
    AND a.status = 'completed';

  -- Calculate base charges
  v_base_charges := (v_employee_count * COALESCE(v_config.base_rate_per_employee, 0)) +
                    (v_family_count * COALESCE(v_config.base_rate_per_family_member, 0));

  -- Calculate billable visits (total - included)
  v_billable_visits := GREATEST(0, v_total_visits - (v_config.visit_included_per_user * (v_employee_count + v_family_count)));
  
  -- Calculate visit charges
  v_visit_charges := v_billable_visits * COALESCE(v_config.visit_price, 0);

  -- Insert or update billing period
  INSERT INTO billing_periods (
    employer_id,
    period_start,
    period_end,
    employee_count,
    family_member_count,
    total_visits,
    billable_visits,
    base_charges,
    visit_charges,
    total_amount
  ) VALUES (
    p_employer_id,
    p_period_start,
    p_period_end,
    v_employee_count,
    v_family_count,
    v_total_visits,
    v_billable_visits,
    v_base_charges,
    v_visit_charges,
    v_base_charges + v_visit_charges
  )
  ON CONFLICT (employer_id, period_start, period_end)
  DO UPDATE SET
    employee_count = EXCLUDED.employee_count,
    family_member_count = EXCLUDED.family_member_count,
    total_visits = EXCLUDED.total_visits,
    billable_visits = EXCLUDED.billable_visits,
    base_charges = EXCLUDED.base_charges,
    visit_charges = EXCLUDED.visit_charges,
    total_amount = EXCLUDED.total_amount,
    updated_at = NOW()
  RETURNING * INTO v_period;

  RETURN v_period;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate subscription-based invoice
CREATE OR REPLACE FUNCTION generate_subscription_invoice(
  p_employer_id UUID,
  p_period_start DATE,
  p_period_end DATE
)
RETURNS UUID AS $$
DECLARE
  v_period billing_periods;
  v_invoice_id UUID;
  v_employer employers;
  v_config billing_configs;
BEGIN
  -- Calculate billing period
  v_period := calculate_billing_period(p_employer_id, p_period_start, p_period_end);
  
  -- Get employer and config details
  SELECT * INTO v_employer FROM employers WHERE id = p_employer_id;
  SELECT * INTO v_config FROM billing_configs WHERE employer_id = p_employer_id;

  -- Create invoice
  INSERT INTO invoices (
    invoice_number,
    employer_id,
    issue_date,
    due_date,
    status,
    total_amount,
    metadata
  ) VALUES (
    'SUB-' || p_employer_id::TEXT || '-' || TO_CHAR(p_period_start, 'YYYYMM'),
    p_employer_id,
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '1 day' * COALESCE(v_config.grace_period_days, 30),
    'pending',
    v_period.total_amount,
    JSONB_BUILD_OBJECT(
      'type', 'subscription',
      'period_id', v_period.id,
      'period_start', p_period_start,
      'period_end', p_period_end,
      'employee_count', v_period.employee_count,
      'family_member_count', v_period.family_member_count,
      'total_visits', v_period.total_visits,
      'billable_visits', v_period.billable_visits,
      'base_charges', v_period.base_charges,
      'visit_charges', v_period.visit_charges,
      'plan_name', v_config.custom_plan_name,
      'billing_frequency', v_config.billing_frequency
    )
  ) RETURNING id INTO v_invoice_id;

  -- Update billing period with invoice reference
  UPDATE billing_periods
  SET invoice_id = v_invoice_id, status = 'invoiced'
  WHERE id = v_period.id;

  RETURN v_invoice_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View for billing period details
CREATE OR REPLACE VIEW billing_period_details AS
SELECT 
  bp.*,
  e.name as employer_name,
  bc.custom_plan_name,
  bc.billing_frequency,
  bc.base_rate_per_employee,
  bc.base_rate_per_family_member,
  bc.visit_price,
  bc.visit_included_per_user,
  i.invoice_number,
  i.status as invoice_status
FROM billing_periods bp
JOIN employers e ON bp.employer_id = e.id
LEFT JOIN billing_configs bc ON e.id = bc.employer_id
LEFT JOIN invoices i ON bp.invoice_id = i.id;

-- Grant permissions
GRANT EXECUTE ON FUNCTION calculate_billing_period TO authenticated;
GRANT EXECUTE ON FUNCTION generate_subscription_invoice TO authenticated;
GRANT SELECT ON billing_period_details TO authenticated;

-- Sample data (commented out)
/*
-- Create billing config for an employer
INSERT INTO billing_configs (
  employer_id,
  base_rate_per_employee,
  base_rate_per_family_member,
  visit_included_per_user,
  visit_price,
  custom_plan_name
) VALUES (
  'employer-uuid-here',
  50.00,  -- $50 per employee
  25.00,  -- $25 per family member
  2,      -- 2 visits included per person
  75.00,  -- $75 per additional visit
  'Premium Health Plan'
);

-- Calculate billing for current month
SELECT calculate_billing_period(
  'employer-uuid-here',
  DATE_TRUNC('month', CURRENT_DATE)::DATE,
  (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day')::DATE
);
*/