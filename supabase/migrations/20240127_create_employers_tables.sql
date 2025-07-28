-- Employers table for managing employer organizations
CREATE TABLE employers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_email TEXT,
  phone TEXT,
  address TEXT,
  logo_url TEXT,
  branding JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for employers
CREATE INDEX idx_employers_name ON employers(name);
CREATE INDEX idx_employers_is_active ON employers(is_active);
CREATE INDEX idx_employers_created_at ON employers(created_at DESC);

-- Employer-patient relationship table
CREATE TABLE employer_patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID REFERENCES employers(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id TEXT,
  department TEXT,
  start_date DATE NOT NULL,
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

-- Add employer_id to invoices table
ALTER TABLE invoices 
ADD COLUMN employer_id UUID REFERENCES employers(id);

-- Create index for employer invoices
CREATE INDEX idx_invoices_employer_id ON invoices(employer_id);

-- Enable RLS for employers
ALTER TABLE employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_patients ENABLE ROW LEVEL SECURITY;

-- RLS Policies for employers table
CREATE POLICY "Owners can manage all employers"
  ON employers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'owner'
    )
  );

CREATE POLICY "Admins can view all employers"
  ON employers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- RLS Policies for employer_patients
CREATE POLICY "Owners can manage all employer-patient relationships"
  ON employer_patients FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'owner'
    )
  );

CREATE POLICY "Patients can view their own employer relationships"
  ON employer_patients FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Providers can view employer info for their patients"
  ON employer_patients FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM appointments a
      WHERE a.provider_id = auth.uid() 
      AND a.patient_id = employer_patients.patient_id
    )
  );

-- Create trigger to update updated_at columns
CREATE TRIGGER update_employers_updated_at
  BEFORE UPDATE ON employers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employer_patients_updated_at
  BEFORE UPDATE ON employer_patients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create view for active employer-patient relationships
CREATE OR REPLACE VIEW active_employer_patients AS
SELECT 
  ep.*,
  e.name as employer_name,
  e.logo_url as employer_logo,
  e.branding as employer_branding,
  p.raw_user_meta_data->>'name' as patient_name,
  p.email as patient_email
FROM employer_patients ep
JOIN employers e ON ep.employer_id = e.id
JOIN auth.users p ON ep.patient_id = p.id
WHERE ep.is_active = true
  AND e.is_active = true;

-- Grant access to the view
GRANT SELECT ON active_employer_patients TO authenticated;

-- Create view for employer invoice summary
CREATE OR REPLACE VIEW employer_invoice_summary AS
SELECT 
  e.id as employer_id,
  e.name as employer_name,
  COUNT(DISTINCT i.id) as total_invoices,
  COUNT(DISTINCT CASE WHEN i.status = 'paid' THEN i.id END) as paid_invoices,
  COUNT(DISTINCT CASE WHEN i.status = 'pending' THEN i.id END) as pending_invoices,
  COALESCE(SUM(i.total_amount), 0) as total_amount,
  COALESCE(SUM(CASE WHEN i.status = 'paid' THEN i.total_amount ELSE 0 END), 0) as paid_amount,
  COALESCE(SUM(CASE WHEN i.status = 'pending' THEN i.total_amount ELSE 0 END), 0) as pending_amount,
  MAX(i.created_at) as last_invoice_date
FROM employers e
LEFT JOIN invoices i ON e.id = i.employer_id
GROUP BY e.id, e.name;

-- Grant access to the view
GRANT SELECT ON employer_invoice_summary TO authenticated;

-- Function to get patient's current employer
CREATE OR REPLACE FUNCTION get_patient_current_employer(p_patient_id UUID)
RETURNS TABLE(
  employer_id UUID,
  employer_name TEXT,
  start_date DATE,
  employee_id TEXT,
  department TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ep.employer_id,
    e.name as employer_name,
    ep.start_date,
    ep.employee_id,
    ep.department
  FROM employer_patients ep
  JOIN employers e ON ep.employer_id = e.id
  WHERE ep.patient_id = p_patient_id
    AND ep.is_active = true
    AND e.is_active = true
  ORDER BY ep.start_date DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sample data (commented out)
/*
INSERT INTO employers (name, contact_email) VALUES
  ('Acme Corporation', 'hr@acme.com'),
  ('Tech Innovators LLC', 'benefits@techinnovators.com'),
  ('Healthcare Partners', 'admin@healthcarepartners.com');

-- Link patients to employers (replace with actual patient IDs)
INSERT INTO employer_patients (employer_id, patient_id, start_date) VALUES
  ((SELECT id FROM employers WHERE name = 'Acme Corporation'), 'patient-uuid-1', '2024-01-01'),
  ((SELECT id FROM employers WHERE name = 'Tech Innovators LLC'), 'patient-uuid-2', '2023-06-15');
*/