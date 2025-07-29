-- Add AI assistant configuration fields to employers table
ALTER TABLE employers 
ADD COLUMN IF NOT EXISTS assistant_model TEXT DEFAULT 'gpt-4',
ADD COLUMN IF NOT EXISTS assistant_tone TEXT DEFAULT 'professional',
ADD COLUMN IF NOT EXISTS assistant_voice TEXT DEFAULT 'Rachel',
ADD COLUMN IF NOT EXISTS assistant_temp FLOAT DEFAULT 0.7;

-- Add check constraints for valid values
ALTER TABLE employers
ADD CONSTRAINT check_assistant_model CHECK (
  assistant_model IN ('gpt-4', 'gpt-3.5-turbo', 'claude-3-opus', 'claude-3-sonnet', 'gemini-pro')
),
ADD CONSTRAINT check_assistant_tone CHECK (
  assistant_tone IN ('professional', 'friendly', 'concise', 'detailed', 'casual')
),
ADD CONSTRAINT check_assistant_voice CHECK (
  assistant_voice IN ('Rachel', 'Adam', 'Bella', 'Domi', 'Antoni', 'Elli', 'Josh', 'Arnold', 'Sam')
),
ADD CONSTRAINT check_assistant_temp CHECK (
  assistant_temp >= 0 AND assistant_temp <= 2
);

-- Update sample data with different configurations
UPDATE employers SET
  assistant_model = 'gpt-4',
  assistant_tone = 'professional',
  assistant_voice = 'Rachel',
  assistant_temp = 0.7
WHERE name = 'Glow Tech Inc.';

UPDATE employers SET
  assistant_model = 'claude-3-opus',
  assistant_tone = 'friendly',
  assistant_voice = 'Bella',
  assistant_temp = 0.8
WHERE name = 'Sunset Wellness';

UPDATE employers SET
  assistant_model = 'gemini-pro',
  assistant_tone = 'concise',
  assistant_voice = 'Adam',
  assistant_temp = 0.5
WHERE name = 'Horizon Labs';

-- Create view for employer AI configurations
CREATE OR REPLACE VIEW employer_ai_configs AS
SELECT 
  id,
  name,
  subdomain,
  assistant_model,
  assistant_tone,
  assistant_voice,
  assistant_temp,
  primary_color,
  logo_url
FROM employers
ORDER BY name;