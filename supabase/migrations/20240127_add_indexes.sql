-- Add indexes for better query performance

-- Index on vitals_summary for patient lookups
CREATE INDEX IF NOT EXISTS idx_vitals_summary_patient_id ON vitals_summary (patient_id);

-- Index on patient_uploads for patient lookups (if not already exists)
CREATE INDEX IF NOT EXISTS idx_patient_uploads_patient_id ON patient_uploads (patient_id);

-- Index on conversation_insights for user lookups
CREATE INDEX IF NOT EXISTS idx_conversation_insights_user_id ON conversation_insights (user_id);

-- Additional helpful indexes for conversation_insights
CREATE INDEX IF NOT EXISTS idx_conversation_insights_created_at ON conversation_insights (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_insights_user_created ON conversation_insights (user_id, created_at DESC);