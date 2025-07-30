# Public Supabase Setup for Demo Access

This guide explains how to set up your Supabase tables for public/demo access without authentication.

## Option 1: Create a Demo User (Recommended)

1. Create a demo user in your database:
```sql
-- Create a demo user in auth.users (optional)
INSERT INTO auth.users (id, email) 
VALUES ('demo-user-001', 'demo@example.com');

-- Insert demo data for this user
INSERT INTO patients (id, user_id, name) 
VALUES ('demo-patient-001', 'demo-user-001', 'Demo Patient');

-- Add some demo wearables data
INSERT INTO wearables (user_id, heart_rate, sleep_hours, hydration_oz, steps, timestamp)
VALUES 
  ('demo-user-001', 72, 7.5, 64, 8432, NOW()),
  ('demo-user-001', 75, 8, 72, 10234, NOW() - INTERVAL '1 day');

-- Add nutrition data
INSERT INTO nutrition_summary (user_id, date, calories, protein_g, carbs_g, fat_g)
VALUES ('demo-user-001', CURRENT_DATE, 1850, 65, 210, 70);
```

2. Update the DEMO_USER_ID in `/src/services/publicDataService.ts` to match your demo user ID.

## Option 2: Create Public Views with RLS

Create views that allow public read access:

```sql
-- Create a public view for demo stats
CREATE OR REPLACE VIEW public_health_stats AS
SELECT 
  heart_rate,
  sleep_hours,
  hydration_oz,
  steps,
  timestamp
FROM wearables
WHERE user_id = 'demo-user-001';

-- Enable RLS but allow public SELECT
ALTER TABLE public_health_stats OWNER TO authenticated;
GRANT SELECT ON public_health_stats TO anon;
```

## Option 3: Use Service Role Key (Less Secure, Dev Only)

If you're just demoing, you can use the service role key which bypasses RLS:

```javascript
// In your .env file
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

// Create a separate client for demo data
const supabaseAdmin = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);
```

## How It Works

1. **Hybrid Approach**: The dashboard attempts to fetch real data from Supabase
2. **Graceful Fallback**: If Supabase fails or returns no data, it uses beautiful static demo data
3. **No Auth Required**: No login or authentication checks
4. **Visual Indicator**: Shows "Live Data" badge when using real Supabase data

## Customization

To use a different demo user or real user data:

```javascript
// In your component or a config file
import { setDemoUserId } from '@/services/publicDataService';

// Set a specific user ID to display
setDemoUserId('your-real-user-id');
```

## Security Considerations

- Option 1 (Demo User) is safest - only exposes fake demo data
- Option 2 (Public Views) requires careful RLS setup
- Option 3 (Service Role) should NEVER be used in production

## Testing

1. The dashboard will work even if Supabase is down or misconfigured
2. Check the browser console for "Using fallback demo data" messages
3. Look for the "Live Data" badge to confirm Supabase connection