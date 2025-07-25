create table patient_shares (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid,        -- original patient
  shared_with_id uuid,  -- the viewer
  access_labs boolean default true,
  access_meds boolean default true,
  access_appointments boolean default true,
  access_uploads boolean default true,
  access_timeline boolean default true,
  created_at timestamptz default now(),
  revoked boolean default false
);