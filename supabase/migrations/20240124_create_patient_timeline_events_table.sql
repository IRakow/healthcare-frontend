create table patient_timeline_events (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references users(id),
  type text, -- 'vitals', 'lab', 'visit', 'ai', 'upload'
  label text,
  data jsonb,
  created_at timestamptz default now()
);