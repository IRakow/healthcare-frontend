-- Create assignments table to link providers to patients
create table if not exists assignments (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid references auth.users(id) on delete cascade,
  patient_id uuid references auth.users(id) on delete cascade,
  assigned_at timestamptz default now(),
  assigned_by uuid references auth.users(id),
  active boolean default true,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(provider_id, patient_id)
);

-- Create indexes for performance
create index idx_assignments_provider_id on assignments(provider_id);
create index idx_assignments_patient_id on assignments(patient_id);
create index idx_assignments_active on assignments(active);

-- Enable RLS on assignments table
alter table assignments enable row level security;

-- RLS policies for assignments table
-- Providers can see their own assignments
create policy "Providers can view own assignments" on assignments
  for select using (auth.uid() = provider_id);

-- Patients can see who is assigned to them
create policy "Patients can view their providers" on assignments
  for select using (auth.uid() = patient_id);

-- Admins can view all assignments
create policy "Admins can view all assignments" on assignments
  for select using (
    exists (
      select 1 from auth.users
      where auth.users.id = auth.uid()
      and auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Only admins can insert assignments
create policy "Only admins can create assignments" on assignments
  for insert with check (
    exists (
      select 1 from auth.users
      where auth.users.id = auth.uid()
      and auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Only admins can update assignments
create policy "Only admins can update assignments" on assignments
  for update using (
    exists (
      select 1 from auth.users
      where auth.users.id = auth.uid()
      and auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Only admins can delete assignments
create policy "Only admins can delete assignments" on assignments
  for delete using (
    exists (
      select 1 from auth.users
      where auth.users.id = auth.uid()
      and auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Enable RLS on patient_timeline_events if not already enabled
alter table patient_timeline_events enable row level security;

-- Drop existing policies if any
drop policy if exists "Patient or Assigned Provider Only" on patient_timeline_events;

-- Create the RLS policy for patient_timeline_events
-- Only allow providers or the patient themselves to view timeline
create policy "Patient or Assigned Provider Only" on patient_timeline_events
  for select using (
    auth.uid() = patient_id
    OR auth.uid() in (
      select provider_id from assignments 
      where patient_id = patient_timeline_events.patient_id 
      and active = true
    )
  );

-- Allow patients to insert their own timeline events
create policy "Patients can insert own events" on patient_timeline_events
  for insert with check (auth.uid() = patient_id);

-- Allow assigned providers to insert timeline events for their patients
create policy "Assigned providers can insert events" on patient_timeline_events
  for insert with check (
    auth.uid() in (
      select provider_id from assignments 
      where patient_id = patient_timeline_events.patient_id 
      and active = true
    )
  );

-- Allow patients and assigned providers to update timeline events
create policy "Patient or assigned provider can update" on patient_timeline_events
  for update using (
    auth.uid() = patient_id
    OR auth.uid() in (
      select provider_id from assignments 
      where patient_id = patient_timeline_events.patient_id 
      and active = true
    )
  );

-- Function to update the updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to update the updated_at column
create trigger update_assignments_updated_at
  before update on assignments
  for each row
  execute function update_updated_at_column();