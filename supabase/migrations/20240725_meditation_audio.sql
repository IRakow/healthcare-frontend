-- Add audio_url column to meditation_logs
ALTER TABLE meditation_logs ADD COLUMN audio_url TEXT;

-- Create meditation_audio table for pre-defined meditation tracks
CREATE TABLE meditation_audio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- 'calm', 'sleep', 'focus', 'anxiety', 'breathing'
  name TEXT NOT NULL,
  audio_url TEXT NOT NULL,
  duration_seconds INT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for type lookups
CREATE INDEX idx_meditation_audio_type ON meditation_audio(type);

-- Insert some default audio tracks (update URLs after uploading to storage)
INSERT INTO meditation_audio (type, name, audio_url, duration_seconds, description) VALUES
  ('focus', 'Focus Enhancement 1', '/meditation-audio/focus-enhancement-1.mp3', 300, 'Enhance concentration and mental clarity'),
  ('calm', 'Peaceful Mind', '/meditation-audio/peaceful-mind.mp3', 600, 'Find inner peace and tranquility'),
  ('sleep', 'Deep Sleep Journey', '/meditation-audio/deep-sleep.mp3', 900, 'Drift into restful sleep'),
  ('anxiety', 'Anxiety Relief', '/meditation-audio/anxiety-relief.mp3', 420, 'Release tension and worry'),
  ('breathing', 'Breath Awareness', '/meditation-audio/breath-awareness.mp3', 180, 'Guided breathing exercise');

-- Add comments
COMMENT ON TABLE meditation_audio IS 'Pre-defined meditation audio tracks';
COMMENT ON COLUMN meditation_audio.audio_url IS 'URL to audio file in Supabase storage';
COMMENT ON COLUMN meditation_logs.audio_url IS 'URL to audio file used for this specific session';