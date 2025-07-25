create table family_members (
  id uuid primary key default gen_random_uuid(),
  account_holder_id uuid references users(id),
  full_name text,
  birthdate date,
  relation text,
  created_at timestamptz default now()
);