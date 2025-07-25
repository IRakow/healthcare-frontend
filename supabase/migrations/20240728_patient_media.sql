create table patient_media (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references users(id),
  type text check (type in ('photo', 'video')),
  file_url text not null,
  ai_summary text,
  reviewed_by uuid references users(id),
  created_at timestamptz default now()
);

-- Add indexes
create index idx_patient_media_patient_id on patient_media(patient_id);
create index idx_patient_media_created_at on patient_media(created_at);
create index idx_patient_media_type on patient_media(type);

-- RLS policies
alter table patient_media enable row level security;

-- Patients can view their own media
create policy "Patients can view own media"
  on patient_media for select
  using (patient_id = auth.uid());

-- Patients can upload their own media
create policy "Patients can upload media"
  on patient_media for insert
  with check (patient_id = auth.uid());

-- Providers can view patient media
create policy "Providers can view patient media"
  on patient_media for select
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
      and users.role = 'provider'
    )
  );

-- Providers can update media (for ai_summary and reviewed_by)
create policy "Providers can update media"
  on patient_media for update
  using (
    exists (
      select 1 from users
      where users.id = auth.uid()
      and users.role = 'provider'
    )
  );

-- Shared access through patient_shares
create policy "Shared users can view media"
  on patient_media for select
  using (
    exists (
      select 1 from patient_shares
      where patient_shares.owner_id = patient_media.patient_id
      and patient_shares.shared_with_id = auth.uid()
      and patient_shares.revoked = false
      and patient_shares.access_uploads = true
    )
  );