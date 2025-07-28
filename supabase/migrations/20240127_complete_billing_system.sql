-- Complete billing system migration
-- This consolidates all billing-related tables and functions

-- Drop existing tables if they exist to avoid conflicts
DROP TABLE IF EXISTS plan_features CASCADE;
DROP TABLE IF EXISTS billing_line_items CASCADE;
DROP TABLE IF EXISTS direct_memberships CASCADE;
DROP TABLE IF EXISTS patient_payments CASCADE;
DROP TABLE IF EXISTS employer_invoices CASCADE;
DROP TABLE IF EXISTS appointment_usage CASCADE;
DROP TABLE IF EXISTS billing_configs CASCADE;
DROP TABLE IF EXISTS billing_periods CASCADE;
DROP TABLE IF EXISTS family_members CASCADE;
DROP TABLE IF EXISTS employer_patients CASCADE;
DROP TABLE IF EXISTS employers CASCADE;

-- Create employers table (enhanced version)
CREATE TABLE employers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  billing_email TEXT,
  contact_email TEXT,
  phone TEXT,
  address TEXT,
  logo_url TEXT,
  branding JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  price_per_employee DECIMAL(10,2) NOT NULL,
  price_per_family_member DECIMAL(10,2),
  included_visits_per_year INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for employers
CREATE INDEX idx_employers_name ON employers(name);
CREATE INDEX idx_employers_is_active ON employers(is_active);
CREATE INDEX idx_employers_created_at ON employers(created_at DESC);

-- Create employer_patients table
CREATE TABLE employer_patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID REFERENCES employers(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_primary_account BOOLEAN DEFAULT TRUE,
  family_members INTEGER DEFAULT 0,
  employee_id TEXT,
  department TEXT,
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN GENERATED ALWAYS AS (end_date IS NULL OR end_date > CURRENT_DATE) STORED,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique active employment per patient
  UNIQUE(employer_id, patient_id, end_date)
);

-- Create indexes for employer_patients
CREATE INDEX idx_employer_patients_employer_id ON employer_patients(employer_id);
CREATE INDEX idx_employer_patients_patient_id ON employer_patients(patient_id);
CREATE INDEX idx_employer_patients_is_active ON employer_patients(is_active);
CREATE INDEX idx_employer_patients_dates ON employer_patients(start_date, end_date);

-- Create appointment_usage table for tracking visit usage
CREATE TABLE appointment_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  employer_id UUID REFERENCES employers(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  billing_year INTEGER NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE),
  used_on TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one usage record per appointment
  UNIQUE(appointment_id)
);

-- Create indexes for appointment_usage
CREATE INDEX idx_appointment_usage_patient_id ON appointment_usage(patient_id);
CREATE INDEX idx_appointment_usage_employer_id ON appointment_usage(employer_id);
CREATE INDEX idx_appointment_usage_billing_year ON appointment_usage(billing_year);

-- Create employer_invoices table
CREATE TABLE employer_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID REFERENCES employers(id) ON DELETE CASCADE,
  invoice_number TEXT UNIQUE,
  invoice_month DATE NOT NULL,
  total_employees INTEGER,
  total_family_members INTEGER,
  total_visits INTEGER DEFAULT 0,
  included_visits INTEGER DEFAULT 0,
  billable_visits INTEGER DEFAULT 0,
  base_charges DECIMAL(10,2) DEFAULT 0,
  visit_charges DECIMAL(10,2) DEFAULT 0,
  total_due DECIMAL(10,2),
  status TEXT CHECK (status IN ('pending', 'paid', 'failed', 'cancelled')) DEFAULT 'pending',
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE,
  payment_reference TEXT,
  notes TEXT,
  
  -- Ensure unique invoice per employer per month
  UNIQUE(employer_id, invoice_month)
);

-- Create indexes for employer_invoices
CREATE INDEX idx_employer_invoices_employer_id ON employer_invoices(employer_id);
CREATE INDEX idx_employer_invoices_invoice_month ON employer_invoices(invoice_month);
CREATE INDEX idx_employer_invoices_status ON employer_invoices(status);

-- Create patient_payments table for direct patient payments
CREATE TABLE patient_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('valor_paytech', 'stripe', 'cash', 'insurance')),
  transaction_id TEXT,
  status TEXT CHECK (status IN ('pending', 'paid', 'failed', 'refunded')) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  paid_at TIMESTAMP WITH TIME ZONE,
  refunded_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'
);

-- Create indexes for patient_payments
CREATE INDEX idx_patient_payments_patient_id ON patient_payments(patient_id);
CREATE INDEX idx_patient_payments_appointment_id ON patient_payments(appointment_id);
CREATE INDEX idx_patient_payments_status ON patient_payments(status);

-- Create direct_memberships table for non-employer patients
CREATE TABLE direct_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  plan_type TEXT CHECK (plan_type IN ('individual', 'family')) NOT NULL,
  monthly_fee DECIMAL(10,2) NOT NULL,
  family_members INTEGER DEFAULT 0,
  included_visits_per_month INTEGER DEFAULT 2,
  next_billing_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  cancellation_date DATE,
  cancellation_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for direct_memberships
CREATE INDEX idx_direct_memberships_patient_id ON direct_memberships(patient_id);
CREATE INDEX idx_direct_memberships_is_active ON direct_memberships(is_active);
CREATE INDEX idx_direct_memberships_next_billing_date ON direct_memberships(next_billing_date);

-- Create billing_configs table for advanced employer configurations
CREATE TABLE billing_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID REFERENCES employers(id) ON DELETE CASCADE UNIQUE,
  base_rate_per_employee DECIMAL(10,2),
  base_rate_per_family_member DECIMAL(10,2),
  visit_included_per_user INTEGER DEFAULT 0,
  visit_price DECIMAL(10,2),
  billing_frequency TEXT CHECK (billing_frequency IN ('monthly', 'quarterly', 'annually')) DEFAULT 'monthly',
  grace_period_days INTEGER DEFAULT 30,
  allow_family_members BOOLEAN DEFAULT true,
  max_family_members_per_account INTEGER DEFAULT 5,
  subscription_type TEXT CHECK (subscription_type IN ('employer', 'direct', 'hybrid')) DEFAULT 'employer',
  custom_plan_name TEXT,
  custom_notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for billing_configs
CREATE INDEX idx_billing_configs_employer_id ON billing_configs(employer_id);
CREATE INDEX idx_billing_configs_is_active ON billing_configs(is_active);

-- Create billing_line_items table for detailed invoice breakdowns
CREATE TABLE billing_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID REFERENCES employer_invoices(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  unit_count INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) GENERATED ALWAYS AS (unit_count * unit_price) STORED,
  item_type TEXT CHECK (item_type IN ('subscription', 'visit', 'adjustment', 'credit')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for billing_line_items
CREATE INDEX idx_billing_line_items_invoice_id ON billing_line_items(invoice_id);
CREATE INDEX idx_billing_line_items_patient_id ON billing_line_items(patient_id);

-- Create plan_features table for feature toggles
CREATE TABLE plan_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id UUID REFERENCES billing_configs(id) ON DELETE CASCADE,
  feature_key TEXT NOT NULL,
  feature_name TEXT,
  description TEXT,
  is_enabled BOOLEAN DEFAULT true,
  additional_cost DECIMAL(10,2) DEFAULT 0.00,
  usage_limit INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique features per config
  UNIQUE(config_id, feature_key)
);

-- Create indexes for plan_features
CREATE INDEX idx_plan_features_config_id ON plan_features(config_id);
CREATE INDEX idx_plan_features_is_enabled ON plan_features(is_enabled);

-- Enable RLS on all tables
ALTER TABLE employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE direct_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_features ENABLE ROW LEVEL SECURITY;

-- RLS Policies for employers
CREATE POLICY "Owners can manage all employers"
  ON employers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'owner'
    )
  );

-- RLS Policies for employer_patients
CREATE POLICY "Patients can view their own employer relationships"
  ON employer_patients FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Owners can manage all employer-patient relationships"
  ON employer_patients FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'owner'
    )
  );

-- RLS Policies for appointment_usage
CREATE POLICY "Patients can view their own usage"
  ON appointment_usage FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "System can manage appointment usage"
  ON appointment_usage FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name IN ('owner', 'admin')
    )
  );

-- RLS Policies for patient_payments
CREATE POLICY "Patients can view their own payments"
  ON patient_payments FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Patients can create their own payments"
  ON patient_payments FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

-- RLS Policies for direct_memberships
CREATE POLICY "Patients can view their own membership"
  ON direct_memberships FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Owners can manage all memberships"
  ON direct_memberships FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'owner'
    )
  );

-- Create triggers for updated_at
CREATE TRIGGER update_employers_updated_at
  BEFORE UPDATE ON employers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employer_patients_updated_at
  BEFORE UPDATE ON employer_patients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_billing_configs_updated_at
  BEFORE UPDATE ON billing_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_direct_memberships_updated_at
  BEFORE UPDATE ON direct_memberships
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate monthly invoice for an employer
CREATE OR REPLACE FUNCTION generate_monthly_employer_invoice(
  p_employer_id UUID,
  p_invoice_month DATE
)
RETURNS UUID AS $$
DECLARE
  v_invoice_id UUID;
  v_employer employers;
  v_config billing_configs;
  v_employee_count INTEGER;
  v_family_count INTEGER;
  v_total_visits INTEGER;
  v_included_visits INTEGER;
  v_billable_visits INTEGER;
  v_base_charges DECIMAL(10,2) := 0;
  v_visit_charges DECIMAL(10,2) := 0;
  v_total_due DECIMAL(10,2) := 0;
BEGIN
  -- Get employer details
  SELECT * INTO v_employer FROM employers WHERE id = p_employer_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Employer not found';
  END IF;

  -- Get billing config (optional override)
  SELECT * INTO v_config FROM billing_configs 
  WHERE employer_id = p_employer_id AND is_active = true;

  -- Count active employees for the month
  SELECT COUNT(DISTINCT patient_id) INTO v_employee_count
  FROM employer_patients
  WHERE employer_id = p_employer_id
    AND start_date <= (p_invoice_month + INTERVAL '1 month - 1 day')::DATE
    AND (end_date IS NULL OR end_date >= p_invoice_month);

  -- Count family members
  SELECT COALESCE(SUM(family_members), 0) INTO v_family_count
  FROM employer_patients
  WHERE employer_id = p_employer_id
    AND is_primary_account = true
    AND start_date <= (p_invoice_month + INTERVAL '1 month - 1 day')::DATE
    AND (end_date IS NULL OR end_date >= p_invoice_month);

  -- Count visits for the month
  SELECT COUNT(*) INTO v_total_visits
  FROM appointment_usage au
  JOIN appointments a ON au.appointment_id = a.id
  WHERE au.employer_id = p_employer_id
    AND a.appointment_date >= p_invoice_month
    AND a.appointment_date < p_invoice_month + INTERVAL '1 month'
    AND a.status = 'completed';

  -- Calculate charges using config or employer defaults
  IF v_config IS NOT NULL THEN
    v_base_charges := (v_employee_count * COALESCE(v_config.base_rate_per_employee, 0)) +
                      (v_family_count * COALESCE(v_config.base_rate_per_family_member, 0));
    v_included_visits := v_config.visit_included_per_user * (v_employee_count + v_family_count);
    v_billable_visits := GREATEST(0, v_total_visits - v_included_visits);
    v_visit_charges := v_billable_visits * COALESCE(v_config.visit_price, 0);
  ELSE
    v_base_charges := (v_employee_count * v_employer.price_per_employee) +
                      (v_family_count * COALESCE(v_employer.price_per_family_member, 0));
    -- Pro-rate annual visits to monthly
    v_included_visits := ROUND(v_employer.included_visits_per_year::NUMERIC / 12 * (v_employee_count + v_family_count));
    v_billable_visits := GREATEST(0, v_total_visits - v_included_visits);
    -- Default visit price if not in config
    v_visit_charges := v_billable_visits * 75; -- Default $75 per extra visit
  END IF;

  v_total_due := v_base_charges + v_visit_charges;

  -- Create invoice
  INSERT INTO employer_invoices (
    employer_id,
    invoice_number,
    invoice_month,
    total_employees,
    total_family_members,
    total_visits,
    included_visits,
    billable_visits,
    base_charges,
    visit_charges,
    total_due
  ) VALUES (
    p_employer_id,
    'INV-' || TO_CHAR(p_invoice_month, 'YYYYMM') || '-' || SUBSTRING(p_employer_id::TEXT, 1, 8),
    p_invoice_month,
    v_employee_count,
    v_family_count,
    v_total_visits,
    v_included_visits,
    v_billable_visits,
    v_base_charges,
    v_visit_charges,
    v_total_due
  )
  ON CONFLICT (employer_id, invoice_month) 
  DO UPDATE SET
    total_employees = EXCLUDED.total_employees,
    total_family_members = EXCLUDED.total_family_members,
    total_visits = EXCLUDED.total_visits,
    included_visits = EXCLUDED.included_visits,
    billable_visits = EXCLUDED.billable_visits,
    base_charges = EXCLUDED.base_charges,
    visit_charges = EXCLUDED.visit_charges,
    total_due = EXCLUDED.total_due,
    generated_at = NOW()
  RETURNING id INTO v_invoice_id;

  -- Create line items
  -- Base subscription charges
  IF v_employee_count > 0 THEN
    INSERT INTO billing_line_items (invoice_id, description, unit_count, unit_price, item_type)
    VALUES (
      v_invoice_id,
      'Employee Subscriptions',
      v_employee_count,
      COALESCE(v_config.base_rate_per_employee, v_employer.price_per_employee),
      'subscription'
    );
  END IF;

  IF v_family_count > 0 THEN
    INSERT INTO billing_line_items (invoice_id, description, unit_count, unit_price, item_type)
    VALUES (
      v_invoice_id,
      'Family Member Subscriptions',
      v_family_count,
      COALESCE(v_config.base_rate_per_family_member, v_employer.price_per_family_member),
      'subscription'
    );
  END IF;

  -- Visit charges
  IF v_billable_visits > 0 THEN
    INSERT INTO billing_line_items (invoice_id, description, unit_count, unit_price, item_type)
    VALUES (
      v_invoice_id,
      'Additional Visits (beyond ' || v_included_visits || ' included)',
      v_billable_visits,
      COALESCE(v_config.visit_price, 75.00),
      'visit'
    );
  END IF;

  RETURN v_invoice_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check visit allowance
CREATE OR REPLACE FUNCTION check_visit_allowance(
  p_patient_id UUID,
  p_appointment_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE(
  has_coverage BOOLEAN,
  coverage_type TEXT,
  visits_used INTEGER,
  visits_allowed INTEGER,
  visits_remaining INTEGER,
  requires_payment BOOLEAN
) AS $$
DECLARE
  v_employer_id UUID;
  v_direct_membership direct_memberships;
  v_employer employers;
  v_config billing_configs;
  v_year INTEGER := EXTRACT(YEAR FROM p_appointment_date);
  v_month DATE := DATE_TRUNC('month', p_appointment_date);
  v_visits_used INTEGER := 0;
  v_visits_allowed INTEGER := 0;
BEGIN
  -- Check employer coverage
  SELECT ep.employer_id INTO v_employer_id
  FROM employer_patients ep
  WHERE ep.patient_id = p_patient_id
    AND ep.start_date <= p_appointment_date
    AND (ep.end_date IS NULL OR ep.end_date >= p_appointment_date)
  LIMIT 1;

  IF v_employer_id IS NOT NULL THEN
    -- Get employer and config
    SELECT * INTO v_employer FROM employers WHERE id = v_employer_id;
    SELECT * INTO v_config FROM billing_configs WHERE employer_id = v_employer_id AND is_active = true;
    
    -- Count visits used this year
    SELECT COUNT(*) INTO v_visits_used
    FROM appointment_usage
    WHERE patient_id = p_patient_id
      AND employer_id = v_employer_id
      AND billing_year = v_year;
    
    -- Calculate allowed visits
    IF v_config IS NOT NULL AND v_config.visit_included_per_user > 0 THEN
      -- Use monthly allowance from config
      v_visits_allowed := v_config.visit_included_per_user * 12;
    ELSE
      -- Use annual allowance from employer
      v_visits_allowed := v_employer.included_visits_per_year;
    END IF;
    
    RETURN QUERY SELECT 
      true,
      'employer'::TEXT,
      v_visits_used,
      v_visits_allowed,
      GREATEST(0, v_visits_allowed - v_visits_used),
      (v_visits_used >= v_visits_allowed);
  ELSE
    -- Check direct membership
    SELECT * INTO v_direct_membership
    FROM direct_memberships
    WHERE patient_id = p_patient_id
      AND is_active = true
      AND next_billing_date > p_appointment_date;
    
    IF v_direct_membership IS NOT NULL THEN
      -- Count visits used this month
      SELECT COUNT(*) INTO v_visits_used
      FROM appointments
      WHERE patient_id = p_patient_id
        AND appointment_date >= v_month
        AND appointment_date < v_month + INTERVAL '1 month'
        AND status = 'completed';
      
      v_visits_allowed := v_direct_membership.included_visits_per_month;
      
      RETURN QUERY SELECT 
        true,
        'direct'::TEXT,
        v_visits_used,
        v_visits_allowed,
        GREATEST(0, v_visits_allowed - v_visits_used),
        (v_visits_used >= v_visits_allowed);
    ELSE
      -- No coverage
      RETURN QUERY SELECT 
        false,
        'none'::TEXT,
        0,
        0,
        0,
        true;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Views for reporting
CREATE OR REPLACE VIEW employer_billing_summary AS
SELECT 
  e.id as employer_id,
  e.name as employer_name,
  e.billing_email,
  COUNT(DISTINCT ep.patient_id) as active_employees,
  COALESCE(SUM(ep.family_members), 0) as total_family_members,
  COUNT(DISTINCT ei.id) as total_invoices,
  COALESCE(SUM(CASE WHEN ei.status = 'paid' THEN ei.total_due ELSE 0 END), 0) as total_paid,
  COALESCE(SUM(CASE WHEN ei.status = 'pending' THEN ei.total_due ELSE 0 END), 0) as total_pending
FROM employers e
LEFT JOIN employer_patients ep ON e.id = ep.employer_id AND ep.is_active = true
LEFT JOIN employer_invoices ei ON e.id = ei.employer_id
WHERE e.is_active = true
GROUP BY e.id, e.name, e.billing_email;

-- Grant permissions
GRANT SELECT ON employer_billing_summary TO authenticated;
GRANT EXECUTE ON FUNCTION generate_monthly_employer_invoice TO authenticated;
GRANT EXECUTE ON FUNCTION check_visit_allowance TO authenticated;