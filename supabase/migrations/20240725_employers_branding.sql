-- Add branding columns to employers table
ALTER TABLE employers ADD COLUMN favicon_url TEXT;
ALTER TABLE employers ADD COLUMN logo_url TEXT;

-- Add comments for documentation
COMMENT ON COLUMN employers.favicon_url IS 'URL to the employer''s favicon image (typically 32x32 or 64x64)';
COMMENT ON COLUMN employers.logo_url IS 'URL to the employer''s full logo image for branding';

-- Example update for existing employers (optional)
-- UPDATE employers 
-- SET 
--   favicon_url = 'https://example.com/favicon.ico',
--   logo_url = 'https://example.com/logo.png'
-- WHERE name = 'Example Employer';