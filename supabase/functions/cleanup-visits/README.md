# Cleanup Visits Function

This Edge Function automatically completes video visits that have been in progress for too long.

## Deployment

1. Deploy the function:
```bash
supabase functions deploy cleanup-visits
```

2. Set environment variables (optional):
```bash
supabase secrets set CLEANUP_TIMEOUT_HOURS=2
```

## Scheduling

To run this function periodically, you can:

1. **Using pg_cron (recommended)**:
```sql
-- Run every hour
SELECT cron.schedule(
  'cleanup-stale-visits',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/cleanup-visits',
    headers := jsonb_build_object(
      'Authorization', 'Bearer YOUR_ANON_KEY'
    )
  );
  $$
);
```

2. **Using external cron service**:
   - Set up a cron job to POST to: `https://your-project.supabase.co/functions/v1/cleanup-visits`
   - Include Authorization header with your anon key

3. **Manual trigger**:
```bash
curl -X POST https://your-project.supabase.co/functions/v1/cleanup-visits \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

## Configuration

- `CLEANUP_TIMEOUT_HOURS`: Number of hours before an in-progress visit is auto-completed (default: 1)

## How it works

1. Fetches all appointments with status 'in_progress'
2. Checks if the appointment start time is older than the timeout period
3. Updates expired appointments to 'complete' status
4. Creates timeline events for auto-completed visits
5. Returns a summary of cleaned up visits