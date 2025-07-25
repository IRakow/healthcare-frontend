-- Add video_url column for storing video conference links
ALTER TABLE appointments ADD COLUMN video_url TEXT;

-- Add status column with new status values
-- Note: This will replace any existing status column
ALTER TABLE appointments ADD COLUMN status TEXT DEFAULT 'pending';

-- Update any existing appointments with appropriate status
-- (Optional - uncomment if you have existing data to migrate)
-- UPDATE appointments 
-- SET status = CASE 
--   WHEN status = 'confirmed' THEN 'pending'
--   WHEN status = 'completed' THEN 'complete'
--   WHEN status = 'cancelled' THEN 'cancelled'
--   ELSE 'pending'
-- END
-- WHERE status IS NOT NULL;

-- Add check constraint to ensure valid status values
ALTER TABLE appointments 
ADD CONSTRAINT appointments_status_check 
CHECK (status IN ('pending', 'in_progress', 'complete', 'cancelled'));

-- Add index on status for performance
CREATE INDEX idx_appointments_status ON appointments(status);

-- Add index on video_url for filtering telemedicine appointments
CREATE INDEX idx_appointments_video_url ON appointments(video_url) WHERE video_url IS NOT NULL;