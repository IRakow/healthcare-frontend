-- Add additional profile fields to users table
ALTER TABLE users ADD COLUMN dob date;
ALTER TABLE users ADD COLUMN phone text;
ALTER TABLE users ADD COLUMN assistant_tone text DEFAULT 'professional' CHECK (assistant_tone IN ('professional', 'friendly', 'casual', 'concise'));
ALTER TABLE users ADD COLUMN notifications_enabled boolean DEFAULT true;

-- Add indexes for new fields
CREATE INDEX idx_users_dob ON users(dob);
CREATE INDEX idx_users_notifications_enabled ON users(notifications_enabled);

-- Add comments
COMMENT ON COLUMN users.dob IS 'Date of birth';
COMMENT ON COLUMN users.phone IS 'Phone number for notifications';
COMMENT ON COLUMN users.assistant_tone IS 'Preferred AI assistant communication tone';
COMMENT ON COLUMN users.notifications_enabled IS 'Whether user wants to receive notifications';