create table grocery_history (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references users(id),
  source_plan text,
  list jsonb not null,
  notes text,
  created_at timestamptz default now()
);

-- Add indexes
create index idx_grocery_history_patient_id on grocery_history(patient_id);
create index idx_grocery_history_created_at on grocery_history(created_at);

-- RLS policies
alter table grocery_history enable row level security;

-- Patients can view their own grocery history
create policy "Patients can view own grocery history"
  on grocery_history for select
  using (patient_id = auth.uid());

-- Patients can create their own grocery history
create policy "Patients can create grocery history"
  on grocery_history for insert
  with check (patient_id = auth.uid());

-- Providers can view patient grocery history
create policy "Providers can view patient grocery history"
  on grocery_history for select
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
      and users.role = 'provider'
    )
  );