create table weekly_goals (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid,
  week_start date,
  focus_area text, -- "hydration", "protein", "sleep", etc.
  goal_description text,
  target_value numeric,
  current_value numeric default 0,
  unit text, -- "oz", "g", "hrs"
  completed boolean default false,
  created_at timestamptz default now()
);