-- Create message threads table
CREATE TABLE message_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(patient_id, provider_id)
);

-- Create messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  thread_id UUID REFERENCES message_threads(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  seen BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for efficient queries
CREATE INDEX idx_messages_thread_id ON messages(thread_id);
CREATE INDEX idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_seen ON messages(recipient_id, seen) WHERE seen = FALSE;

CREATE INDEX idx_message_threads_patient_id ON message_threads(patient_id);
CREATE INDEX idx_message_threads_provider_id ON message_threads(provider_id);

-- Add comments
COMMENT ON TABLE message_threads IS 'Conversation threads between patients and providers';
COMMENT ON TABLE messages IS 'Individual messages within conversation threads';
COMMENT ON COLUMN messages.seen IS 'Whether the recipient has read the message';