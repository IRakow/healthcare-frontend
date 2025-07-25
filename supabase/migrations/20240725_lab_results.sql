-- Create lab_results table for storing patient lab test results
CREATE TABLE lab_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  panel TEXT NOT NULL,
  date DATE NOT NULL,
  results JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for efficient queries
CREATE INDEX idx_lab_results_patient_id ON lab_results(patient_id);
CREATE INDEX idx_lab_results_date ON lab_results(date DESC);
CREATE INDEX idx_lab_results_panel ON lab_results(panel);
CREATE INDEX idx_lab_results_patient_date ON lab_results(patient_id, date DESC);

-- Add GIN index for JSONB queries
CREATE INDEX idx_lab_results_results ON lab_results USING GIN (results);

-- Add comments
COMMENT ON TABLE lab_results IS 'Stores patient laboratory test results';
COMMENT ON COLUMN lab_results.panel IS 'Type of lab panel (e.g., Metabolic Panel, CBC, Lipid Panel)';
COMMENT ON COLUMN lab_results.results IS 'JSONB containing test results with test names as keys and values/ranges as values';

-- Example results format:
-- {
--   "glucose": { "value": 95, "unit": "mg/dL", "range": "70-100", "flag": "normal" },
--   "sodium": { "value": 140, "unit": "mEq/L", "range": "136-145", "flag": "normal" },
--   "potassium": { "value": 4.0, "unit": "mEq/L", "range": "3.5-5.0", "flag": "normal" }
-- }