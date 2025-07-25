-- Create meditation_logs table to track user meditation sessions
CREATE TABLE meditation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  duration_minutes int NOT NULL CHECK (duration_minutes > 0),
  created_at timestamptz DEFAULT now()
);

-- Add index for faster queries
CREATE INDEX idx_meditation_logs_user_id ON meditation_logs(user_id);
CREATE INDEX idx_meditation_logs_created_at ON meditation_logs(created_at DESC);

-- Enable RLS
ALTER TABLE meditation_logs ENABLE ROW LEVEL SECURITY;

-- Users can only view their own meditation logs
CREATE POLICY "Users can view own meditation logs" ON meditation_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Users can only insert their own meditation logs
CREATE POLICY "Users can insert own meditation logs" ON meditation_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add check constraint for valid meditation types
ALTER TABLE meditation_logs ADD CONSTRAINT valid_meditation_type 
  CHECK (type IN ('grounding', 'calm', 'sleep', 'ambient'));