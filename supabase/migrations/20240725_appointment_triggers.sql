-- Create function to call edge function when appointment is completed
CREATE OR REPLACE FUNCTION trigger_soap_generation()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger if status changed to 'complete' and transcript not already summarized
  IF NEW.status = 'complete' AND OLD.status != 'complete' AND NEW.transcript_summarized = false THEN
    -- Insert a job record to process this appointment
    -- Note: In production, you'd use pg_cron or a job queue
    -- For now, we'll rely on the cron job to pick it up
    PERFORM pg_notify('appointment_completed', NEW.id::text);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on appointments table
DROP TRIGGER IF EXISTS appointment_status_trigger ON appointments;
CREATE TRIGGER appointment_status_trigger
  AFTER UPDATE OF status ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION trigger_soap_generation();

-- Add index for efficient queries
CREATE INDEX IF NOT EXISTS idx_appointments_status_summarized 
  ON appointments(status, transcript_summarized) 
  WHERE status = 'complete' AND transcript_summarized = false;

-- Comment on the trigger
COMMENT ON TRIGGER appointment_status_trigger ON appointments IS 'Triggers SOAP note generation when appointment is marked complete';