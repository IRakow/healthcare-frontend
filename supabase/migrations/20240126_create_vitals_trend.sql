-- Create vitals_trend table for tracking daily health metrics over time
create table if not exists vitals_trend (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references auth.users(id) on delete cascade,
  date date not null,
  sleep numeric(3,1),
  hydration numeric(4,1),
  protein numeric(4,1),
  steps integer,
  calories integer,
  heart_rate_avg integer,
  blood_pressure_systolic integer,
  blood_pressure_diastolic integer,
  weight numeric(5,2),
  mood_score integer check (mood_score >= 1 and mood_score <= 10),
  energy_level integer check (energy_level >= 1 and energy_level <= 10),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  
  -- Ensure one entry per patient per day
  unique(patient_id, date)
);

-- Create indexes for faster lookups
create index idx_vitals_trend_patient_id on vitals_trend(patient_id);
create index idx_vitals_trend_date on vitals_trend(date desc);
create index idx_vitals_trend_patient_date on vitals_trend(patient_id, date desc);

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

-- Create a function to automatically update the updated_at timestamp
create trigger update_vitals_trend_updated_at
  before update on vitals_trend
  for each row
  execute function update_updated_at_column();

-- Create a view for easy access to the last 30 days of trends
create or replace view vitals_trend_last_30_days as
select 
  vt.*,
  to_char(vt.date, 'Mon DD') as formatted_date,
  to_char(vt.date, 'Day') as day_name
from vitals_trend vt
where vt.date >= current_date - interval '30 days'
order by vt.date desc;

-- Grant access to the view
grant select on vitals_trend_last_30_days to authenticated;

-- Create a function to get weekly averages
create or replace function get_weekly_vitals_average(p_patient_id uuid)
returns table(
  week_start date,
  avg_sleep numeric,
  avg_hydration numeric,
  avg_protein numeric,
  avg_steps numeric,
  avg_calories numeric,
  avg_heart_rate numeric
) as $$
begin
  return query
  select 
    date_trunc('week', date)::date as week_start,
    round(avg(sleep), 1) as avg_sleep,
    round(avg(hydration), 1) as avg_hydration,
    round(avg(protein), 1) as avg_protein,
    round(avg(steps), 0) as avg_steps,
    round(avg(calories), 0) as avg_calories,
    round(avg(heart_rate_avg), 0) as avg_heart_rate
  from vitals_trend
  where patient_id = p_patient_id
    and date >= current_date - interval '12 weeks'
  group by date_trunc('week', date)
  order by week_start desc;
end;
$$ language plpgsql security definer;

-- Sample data insertion (commented out, uncomment and modify for testing)
-- insert into vitals_trend (patient_id, date, sleep, hydration, protein, steps, calories, heart_rate_avg, mood_score, energy_level)
-- values 
--   ('your-user-uuid', current_date, 7.5, 64, 85, 8432, 2100, 72, 8, 7),
--   ('your-user-uuid', current_date - 1, 6.8, 72, 92, 10150, 2350, 75, 7, 6),
--   ('your-user-uuid', current_date - 2, 8.2, 80, 78, 6890, 1950, 70, 9, 8);