-- Create ai_logs table for tracking AI assistant interactions
CREATE TABLE IF NOT EXISTS ai_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  user_name TEXT,
  action TEXT NOT NULL, -- 'query', 'voice_transcription', 'symptom_check', etc.
  model TEXT, -- 'gpt-4', 'claude-3', 'gemini-pro', etc.
  input TEXT,
  output TEXT,
  tokens_used INTEGER,
  duration_ms INTEGER,
  employer_id UUID REFERENCES employers(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_ai_logs_user_id ON ai_logs(user_id);
CREATE INDEX idx_ai_logs_employer_id ON ai_logs(employer_id);
CREATE INDEX idx_ai_logs_created_at ON ai_logs(created_at DESC);
CREATE INDEX idx_ai_logs_action ON ai_logs(action);
CREATE INDEX idx_ai_logs_model ON ai_logs(model);

-- Enable RLS
ALTER TABLE ai_logs ENABLE ROW LEVEL SECURITY;

-- Policies
-- Users can view their own AI logs
CREATE POLICY "Users can view own AI logs" ON ai_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Admins and owners can view all AI logs
CREATE POLICY "Admin can view all AI logs" ON ai_logs
  FOR SELECT USING (
    auth.jwt() ->> 'role' IN ('admin', 'owner')
  );

-- System can insert AI logs
CREATE POLICY "System can insert AI logs" ON ai_logs
  FOR INSERT WITH CHECK (true);

-- Create function to log AI interactions
CREATE OR REPLACE FUNCTION log_ai_interaction(
  p_action TEXT,
  p_model TEXT DEFAULT NULL,
  p_input TEXT DEFAULT NULL,
  p_output TEXT DEFAULT NULL,
  p_tokens INTEGER DEFAULT NULL,
  p_duration INTEGER DEFAULT NULL,
  p_employer_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
  v_user_data RECORD;
BEGIN
  -- Get user data
  SELECT 
    id,
    email,
    raw_user_meta_data->>'full_name' as full_name
  INTO v_user_data
  FROM auth.users
  WHERE id = auth.uid();

  -- Insert log
  INSERT INTO ai_logs (
    user_id,
    user_email,
    user_name,
    action,
    model,
    input,
    output,
    tokens_used,
    duration_ms,
    employer_id,
    metadata
  ) VALUES (
    auth.uid(),
    v_user_data.email,
    v_user_data.full_name,
    p_action,
    p_model,
    p_input,
    p_output,
    p_tokens,
    p_duration,
    p_employer_id,
    p_metadata
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create view for easy access
CREATE OR REPLACE VIEW ai_logs_summary AS
SELECT 
  al.*,
  e.name as employer_name,
  CASE 
    WHEN LENGTH(al.input) > 100 THEN SUBSTRING(al.input, 1, 97) || '...'
    ELSE al.input
  END as input_preview,
  CASE 
    WHEN LENGTH(al.output) > 100 THEN SUBSTRING(al.output, 1, 97) || '...'
    ELSE al.output
  END as output_preview
FROM ai_logs al
LEFT JOIN employers e ON al.employer_id = e.id
ORDER BY al.created_at DESC;

-- Grant access to the view
GRANT SELECT ON ai_logs_summary TO authenticated;

-- Sample data
INSERT INTO ai_logs (user_email, user_name, action, model, input, output, tokens_used, duration_ms) VALUES
  ('leo@patient.com', 'Leo Chavez', 'query', 'gpt-4', 'What are my lab results?', 'Your recent lab results show: Triglycerides: 285 mg/dL (elevated), HDL: 38 mg/dL (low), LDL: 142 mg/dL (borderline high). I recommend discussing these results with your doctor.', 156, 2340),
  ('ian@owner.com', 'Ian Rakow', 'query', 'claude-3', 'Show all invoices for July', 'Here are your July invoices: Glow Tech: $14,200 (paid), Horizon Labs: $18,500 (pending), Sunset Medical: $8,300 (paid). Total: $41,000', 89, 1876),
  ('rivas@provider.com', 'Dr. Rivas', 'voice_transcription', 'whisper', 'Patient presents with chronic headaches lasting 3 weeks', NULL, NULL, 4500),
  ('leo@patient.com', 'Leo Chavez', 'symptom_check', 'gemini-pro', 'Headache, dizziness, blurred vision', 'Based on your symptoms, possible causes include: 1) Migraine - characterized by severe headaches with visual disturbances, 2) Tension headaches - often caused by stress, 3) High blood pressure - can cause these symptoms. Please consult a healthcare provider promptly.', 201, 3200);