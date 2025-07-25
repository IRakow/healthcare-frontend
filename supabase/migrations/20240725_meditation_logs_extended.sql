-- Add additional columns to meditation_logs for AI-generated meditations
ALTER TABLE meditation_logs
ADD COLUMN topic TEXT,
ADD COLUMN voice TEXT,
ADD COLUMN model TEXT,
ADD COLUMN include_music BOOLEAN DEFAULT false;

-- Add comments for clarity
COMMENT ON COLUMN meditation_logs.topic IS 'Custom topic for AI-generated meditation sessions';
COMMENT ON COLUMN meditation_logs.voice IS 'Voice selection for text-to-speech (e.g., alloy, echo, fable, onyx, nova, shimmer)';
COMMENT ON COLUMN meditation_logs.model IS 'AI model used to generate the meditation script';
COMMENT ON COLUMN meditation_logs.include_music IS 'Whether background music was included in the session';