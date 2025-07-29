-- Create ai_conversations table
CREATE TABLE IF NOT EXISTS ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  input TEXT NOT NULL,
  output TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX idx_ai_conversations_created_at ON ai_conversations(created_at DESC);

-- Enable RLS
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

-- Policies
-- Users can view their own conversations
CREATE POLICY "Users can view own conversations" ON ai_conversations
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own conversations
CREATE POLICY "Users can create own conversations" ON ai_conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admins can view all conversations
CREATE POLICY "Admin can view all conversations" ON ai_conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND raw_user_meta_data->>'role' IN ('admin', 'owner')
    )
  );

-- Create a view with user details
CREATE OR REPLACE VIEW ai_conversations_with_users AS
SELECT 
  c.*,
  u.email as user_email,
  u.raw_user_meta_data->>'full_name' as user_name,
  u.raw_user_meta_data->>'role' as user_role
FROM ai_conversations c
LEFT JOIN auth.users u ON c.user_id = u.id
ORDER BY c.created_at DESC;

-- Grant access to the view
GRANT SELECT ON ai_conversations_with_users TO authenticated;

-- Sample data
INSERT INTO ai_conversations (user_id, input, output) VALUES
  (NULL, 'What are the symptoms of diabetes?', 'Common symptoms of diabetes include increased thirst, frequent urination, extreme fatigue, blurred vision, slow-healing sores, and unexplained weight loss. Type 2 diabetes may develop slowly with mild symptoms.'),
  (NULL, 'How do I schedule an appointment?', 'To schedule an appointment, you can: 1) Call our office at (555) 123-4567, 2) Use our online portal at patient.example.com, or 3) Ask me to help you find the next available slot with your preferred provider.'),
  (NULL, 'What is my deductible?', 'Based on your Glow Tech health plan, your annual deductible is $1,500 for individual coverage. You have currently met $750 of your deductible this year. Your out-of-pocket maximum is $5,000.'),
  (NULL, 'Show me my recent lab results', 'Your recent lab results from July 15, 2025 show: Glucose: 95 mg/dL (normal), Total Cholesterol: 185 mg/dL (desirable), Blood Pressure: 118/76 (normal). All values are within healthy ranges.');