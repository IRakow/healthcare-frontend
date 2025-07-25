-- Add onboarding_status column to users table
ALTER TABLE users ADD COLUMN onboarding_status text DEFAULT 'not_started';

-- Add check constraint for valid onboarding statuses
ALTER TABLE users ADD CONSTRAINT valid_onboarding_status 
  CHECK (onboarding_status IN ('not_started', 'in_progress', 'completed'));