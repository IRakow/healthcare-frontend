-- Create drug_names lookup table
CREATE TABLE drug_names (
  name text PRIMARY KEY,
  generic_name text,
  drug_class text,
  common_uses text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better search performance
CREATE INDEX idx_drug_names_generic ON drug_names(generic_name);
CREATE INDEX idx_drug_names_class ON drug_names(drug_class);

-- Enable RLS
ALTER TABLE drug_names ENABLE ROW LEVEL SECURITY;

-- Everyone can read drug names (public reference data)
CREATE POLICY "Public read access to drug names" ON drug_names
  FOR SELECT USING (true);

-- Only admins can manage drug names
CREATE POLICY "Admins can insert drug names" ON drug_names
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can update drug names" ON drug_names
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete drug names" ON drug_names
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Insert some common medications
INSERT INTO drug_names (name, generic_name, drug_class, common_uses) VALUES
  ('Tylenol', 'Acetaminophen', 'Analgesic', 'Pain relief, fever reduction'),
  ('Advil', 'Ibuprofen', 'NSAID', 'Pain relief, inflammation reduction'),
  ('Aspirin', 'Acetylsalicylic acid', 'NSAID', 'Pain relief, blood thinner'),
  ('Amoxicillin', 'Amoxicillin', 'Antibiotic', 'Bacterial infections'),
  ('Lisinopril', 'Lisinopril', 'ACE inhibitor', 'High blood pressure'),
  ('Metformin', 'Metformin', 'Antidiabetic', 'Type 2 diabetes'),
  ('Lipitor', 'Atorvastatin', 'Statin', 'High cholesterol'),
  ('Zoloft', 'Sertraline', 'SSRI', 'Depression, anxiety'),
  ('Synthroid', 'Levothyroxine', 'Thyroid hormone', 'Hypothyroidism'),
  ('Ventolin', 'Albuterol', 'Bronchodilator', 'Asthma, COPD')
ON CONFLICT (name) DO NOTHING;

-- Add comment
COMMENT ON TABLE drug_names IS 'Reference table for medication names and information';