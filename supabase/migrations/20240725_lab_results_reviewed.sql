-- Add reviewed column to lab_results table
ALTER TABLE lab_results 
ADD COLUMN reviewed BOOLEAN DEFAULT FALSE;

-- Add index for efficient queries
CREATE INDEX idx_lab_results_reviewed ON lab_results(reviewed) WHERE reviewed = FALSE;

-- Add comment
COMMENT ON COLUMN lab_results.reviewed IS 'Whether the lab results have been reviewed by a provider';