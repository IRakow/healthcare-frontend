-- Create meditation_logs table
CREATE TABLE meditation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT, -- 'calm', 'sleep', 'focus', 'anxiety', 'breathing', etc.
  duration_minutes INT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Add indexes for performance
CREATE INDEX idx_meditation_logs_user_id ON meditation_logs(user_id);
CREATE INDEX idx_meditation_logs_started_at ON meditation_logs(started_at DESC);

-- Add RLS policies
ALTER TABLE meditation_logs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own meditation logs
CREATE POLICY "Users can view own meditation logs" ON meditation_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own meditation logs
CREATE POLICY "Users can insert own meditation logs" ON meditation_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own meditation logs
CREATE POLICY "Users can update own meditation logs" ON meditation_logs
  FOR UPDATE USING (auth.uid() = user_id);

-- Add comments for documentation
COMMENT ON TABLE meditation_logs IS 'Tracks user meditation sessions';
COMMENT ON COLUMN meditation_logs.type IS 'Type of meditation: calm, sleep, focus, anxiety, breathing, etc.';
COMMENT ON COLUMN meditation_logs.duration_minutes IS 'Duration of the meditation session in minutes';
COMMENT ON COLUMN meditation_logs.started_at IS 'When the meditation session started';
COMMENT ON COLUMN meditation_logs.completed_at IS 'When the meditation session was completed';