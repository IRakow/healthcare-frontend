-- Create vitals_summary table for patient health metrics
create table if not exists vitals_summary (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references auth.users(id) on delete cascade,
  sleep_hours numeric(3,1),
  hydration_oz numeric(4,1),
  workouts_this_week integer default 0,
  protein_grams numeric(4,1),
  risk_flags integer default 0,
  heart_rate_avg integer,
  blood_pressure varchar(10),
  stress_level varchar(20),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create an index for faster lookups
create index idx_vitals_summary_patient_id on vitals_summary(patient_id);

-- Enable RLS (Row Level Security)
alter table vitals_summary enable row level security;

-- Create policies for vitals_summary
create policy "Users can view their own vitals"
  on vitals_summary for select
  using (auth.uid() = patient_id);

create policy "Users can insert their own vitals"
  on vitals_summary for insert
  with check (auth.uid() = patient_id);

create policy "Users can update their own vitals"
  on vitals_summary for update
  using (auth.uid() = patient_id);

-- Create a function to automatically update the updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create a trigger to update the updated_at column
create trigger update_vitals_summary_updated_at
  before update on vitals_summary
  for each row
  execute function update_updated_at_column();

-- Insert sample data for testing (optional)
-- This will only work if you have a test user
-- insert into vitals_summary (patient_id, sleep_hours, hydration_oz, workouts_this_week, protein_grams, risk_flags)
-- values 
--   ('your-user-uuid-here', 7.5, 64, 3, 85, 0);