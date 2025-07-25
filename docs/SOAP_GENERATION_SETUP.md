# SOAP Note Generation Setup

## Overview
The SOAP note generation runs automatically in three ways:
1. **Cron Job** - Every 5-10 minutes
2. **Database Trigger** - When appointment status changes to 'complete'
3. **Manual Trigger** - When provider clicks "Complete Visit" button

## 1. Cron Job Setup

In Supabase Dashboard:
1. Go to Database → Extensions
2. Enable `pg_cron` extension
3. Go to SQL Editor and run:

```sql
-- Schedule SOAP generation every 10 minutes
SELECT cron.schedule(
  'generate-soap-notes',
  '*/10 * * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/generate-soap-notes',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.supabase_service_role_key'),
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);
```

## 2. Database Trigger
The trigger is automatically created by the migration file:
- `/supabase/migrations/20240725_appointment_triggers.sql`
- Fires when appointment status changes to 'complete'
- Only processes if `transcript_summarized = false`

## 3. Manual Trigger via UI

### Add CompleteVisitButton to your provider interface:

```tsx
import { CompleteVisitButton } from '@/components/CompleteVisitButton';

// In your component
<CompleteVisitButton 
  appointmentId={appointmentId} 
  onComplete={() => {
    // Optional: Navigate away or refresh
    navigate('/provider/dashboard');
  }}
/>
```

## Edge Functions Required

1. **generate-soap-notes** - Batch processes all pending appointments
2. **complete-visit** - Marks single appointment complete and triggers SOAP generation
3. **soap-gen** - Generates SOAP note from transcript (already created)

## Environment Variables Needed

In Supabase Dashboard → Edge Functions → Secrets:
- `PurityHealthGemini` - Gemini API key
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (auto-populated)
- `SUPABASE_ANON_KEY` - Anonymous key (auto-populated)

## Testing

1. Create a test appointment with transcripts
2. Mark it complete via UI button or SQL:
   ```sql
   UPDATE appointments 
   SET status = 'complete' 
   WHERE id = 'appointment-id';
   ```
3. Check `patient_timeline_events` for generated SOAP note

## Monitoring

Check processing status:
```sql
-- Appointments needing SOAP generation
SELECT id, patient_id, date, status, transcript_summarized
FROM appointments
WHERE status = 'complete' 
  AND transcript_summarized = false;

-- Recent SOAP notes
SELECT *
FROM patient_timeline_events
WHERE type = 'visit' 
  AND label = 'SOAP Note (AI Generated)'
ORDER BY created_at DESC
LIMIT 10;
```