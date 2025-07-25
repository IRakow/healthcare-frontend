-- Create appointment_transcripts table for storing conversation transcripts
CREATE TABLE appointment_transcripts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  speaker TEXT CHECK (speaker IN ('patient', 'provider', 'system')),
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for appointment lookups
CREATE INDEX idx_appointment_transcripts_appointment_id ON appointment_transcripts(appointment_id);
CREATE INDEX idx_appointment_transcripts_created_at ON appointment_transcripts(created_at);

-- Add column to appointments table to track if transcript has been summarized
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS transcript_summarized BOOLEAN DEFAULT FALSE;

-- Add comments
COMMENT ON TABLE appointment_transcripts IS 'Stores conversation transcripts from appointments';
COMMENT ON COLUMN appointment_transcripts.speaker IS 'Who is speaking: patient, provider, or system';
COMMENT ON COLUMN appointment_transcripts.text IS 'The actual text spoken or system message';
COMMENT ON COLUMN appointments.transcript_summarized IS 'Whether this appointment transcript has been processed into a SOAP note';