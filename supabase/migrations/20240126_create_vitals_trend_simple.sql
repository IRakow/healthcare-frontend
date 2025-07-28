-- Create vitals_trend table for tracking daily health metrics
create table if not exists vitals_trend (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references auth.users(id) on delete cascade,
  date date not null,
  sleep numeric(3,1),
  hydration numeric(4,1),
  protein numeric(4,1),
  created_at timestamp with time zone default now(),
  
  -- Ensure one entry per patient per day
  unique(patient_id, date)
);

-- Create indexes for faster lookups
create index idx_vitals_trend_patient_id on vitals_trend(patient_id);
create index idx_vitals_trend_date on vitals_trend(date desc);

-- Enable RLS (Row Level Security)
alter table vitals_trend enable row level security;

-- Create policies for vitals_trend
create policy "Users can view their own vitals trends"
  on vitals_trend for select
  using (auth.uid() = patient_id);

create policy "Users can insert their own vitals trends"
  on vitals_trend for insert
  with check (auth.uid() = patient_id);

create policy "Users can update their own vitals trends"
  on vitals_trend for update
  using (auth.uid() = patient_id);

create policy "Users can delete their own vitals trends"
  on vitals_trend for delete
  using (auth.uid() = patient_id);

-- Insert sample data for the last 30 days (optional - for testing)
-- Replace 'your-user-uuid' with an actual user ID
/*
DO $$
DECLARE
  user_id uuid := 'your-user-uuid';
  i integer;
BEGIN
  FOR i IN 0..29 LOOP
    INSERT INTO vitals_trend (patient_id, date, sleep, hydration, protein)
    VALUES (
      user_id,
      CURRENT_DATE - i,
      6 + random() * 3,  -- Sleep between 6-9 hours
      50 + random() * 40, -- Hydration between 50-90 oz
      60 + random() * 40  -- Protein between 60-100g
    )
    ON CONFLICT (patient_id, date) DO NOTHING;
  END LOOP;
END $$;
*/