create table wearable_logs (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references users(id),
  source text check (source in ('oura', 'fitbit', 'apple')),
  date date not null,
  steps int,
  heart_rate int,
  hrv int,
  sleep_hours numeric(3,1),
  readiness_score int,
  data jsonb,
  created_at timestamptz default now()
);

-- Add indexes
create index idx_wearable_logs_patient_id on wearable_logs(patient_id);
create index idx_wearable_logs_date on wearable_logs(date);
create index idx_wearable_logs_source on wearable_logs(source);
create index idx_wearable_logs_patient_date on wearable_logs(patient_id, date);

-- Unique constraint to prevent duplicate entries
create unique index idx_wearable_logs_unique on wearable_logs(patient_id, source, date);

-- RLS policies
alter table wearable_logs enable row level security;

-- Patients can view their own wearable data
create policy "Patients can view own wearable data"
  on wearable_logs for select
  using (patient_id = auth.uid());

-- Patients can insert their own wearable data
create policy "Patients can insert wearable data"
  on wearable_logs for insert
  with check (patient_id = auth.uid());

-- Patients can update their own wearable data
create policy "Patients can update wearable data"
  on wearable_logs for update
  using (patient_id = auth.uid());

-- Providers can view patient wearable data
create policy "Providers can view patient wearable data"
  on wearable_logs for select
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
      and users.role = 'provider'
    )
  );

-- Shared access through patient_shares
create policy "Shared users can view wearable data"
  on wearable_logs for select
  using (
    exists (
      select 1 from patient_shares
      where patient_shares.owner_id = wearable_logs.patient_id
      and patient_shares.shared_with_id = auth.uid()
      and patient_shares.revoked = false
    )
  );