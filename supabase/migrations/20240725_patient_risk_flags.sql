-- Create patient_risk_flags table for tracking patient health risks and alerts
CREATE TABLE patient_risk_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  reason TEXT,
  flagged_at TIMESTAMPTZ DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE
);

-- Add indexes for efficient queries
CREATE INDEX idx_patient_risk_flags_patient_id ON patient_risk_flags(patient_id);
CREATE INDEX idx_patient_risk_flags_resolved ON patient_risk_flags(resolved);
CREATE INDEX idx_patient_risk_flags_flagged_at ON patient_risk_flags(flagged_at DESC);
CREATE INDEX idx_patient_risk_flags_patient_unresolved ON patient_risk_flags(patient_id, resolved) WHERE resolved = FALSE;

-- Add comments
COMMENT ON TABLE patient_risk_flags IS 'Tracks health risk flags and alerts for patients';
COMMENT ON COLUMN patient_risk_flags.label IS 'Short label for the risk (e.g., High Blood Pressure, Diabetes Risk)';
COMMENT ON COLUMN patient_risk_flags.reason IS 'Detailed reason or criteria that triggered this flag';
COMMENT ON COLUMN patient_risk_flags.resolved IS 'Whether this risk flag has been addressed or resolved';

-- Example risk flags:
-- label: 'High Blood Pressure'
-- reason: 'BP reading 145/95 on 2024-07-25'
--
-- label: 'Missed Medications'  
-- reason: 'Patient reported not taking prescribed medications for 3 days'
--
-- label: 'Abnormal Lab Result'
-- reason: 'Glucose 250 mg/dL (normal: 70-99)'