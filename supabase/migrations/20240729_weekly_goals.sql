create table weekly_goals (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references users(id),
  week_start date not null,
  focus_area text check (focus_area in ('hydration', 'protein', 'sleep', 'steps', 'exercise', 'meditation', 'calories', 'carbs', 'fiber')),
  goal_description text not null,
  target_value numeric not null,
  current_value numeric default 0,
  unit text not null,
  completed boolean default false,
  created_at timestamptz default now()
);

-- Add indexes
create index idx_weekly_goals_patient_id on weekly_goals(patient_id);
create index idx_weekly_goals_week_start on weekly_goals(week_start);
create index idx_weekly_goals_patient_week on weekly_goals(patient_id, week_start);

-- Unique constraint to prevent duplicate goals per focus area per week
create unique index idx_weekly_goals_unique on weekly_goals(patient_id, week_start, focus_area);

-- RLS policies
alter table weekly_goals enable row level security;

-- Patients can view their own goals
create policy "Patients can view own goals"
  on weekly_goals for select
  using (patient_id = auth.uid());

-- Patients can create their own goals
create policy "Patients can create goals"
  on weekly_goals for insert
  with check (patient_id = auth.uid());

-- Patients can update their own goals
create policy "Patients can update goals"
  on weekly_goals for update
  using (patient_id = auth.uid());

-- Providers can view patient goals
create policy "Providers can view patient goals"
  on weekly_goals for select
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
      and users.role = 'provider'
    )
  );

-- Shared access through patient_shares
create policy "Shared users can view goals"
  on weekly_goals for select
  using (
    exists (
      select 1 from patient_shares
      where patient_shares.owner_id = weekly_goals.patient_id
      and patient_shares.shared_with_id = auth.uid()
      and patient_shares.revoked = false
    )
  );