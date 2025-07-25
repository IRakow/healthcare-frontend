-- Create medications table
CREATE TABLE medications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  strength text,
  dosage text,
  frequency text,
  start_date date DEFAULT CURRENT_DATE,
  end_date date,
  prescriber text,
  notes text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_medications_patient_id ON medications(patient_id);
CREATE INDEX idx_medications_is_active ON medications(is_active);
CREATE INDEX idx_medications_created_at ON medications(created_at DESC);

-- Enable RLS
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;

-- Patients can view their own medications
CREATE POLICY "Patients can view own medications" ON medications
  FOR SELECT USING (auth.uid() = patient_id);

-- Patients can add their own medications
CREATE POLICY "Patients can insert own medications" ON medications
  FOR INSERT WITH CHECK (auth.uid() = patient_id);

-- Patients can update their own medications
CREATE POLICY "Patients can update own medications" ON medications
  FOR UPDATE USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

-- Patients can delete their own medications
CREATE POLICY "Patients can delete own medications" ON medications
  FOR DELETE USING (auth.uid() = patient_id);

-- Providers can view patient medications (if we have a provider access system)
CREATE POLICY "Providers can view patient medications" ON medications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'provider'
    )
  );

-- Create updated_at trigger
CREATE TRIGGER update_medications_updated_at 
  BEFORE UPDATE ON medications 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE medications IS 'Patient medication records';
COMMENT ON COLUMN medications.strength IS 'Medication strength (e.g., 10mg, 500mg)';
COMMENT ON COLUMN medications.dosage IS 'Dosage instructions (e.g., 1 tablet, 2 capsules)';
COMMENT ON COLUMN medications.frequency IS 'How often to take (e.g., twice daily, as needed)';