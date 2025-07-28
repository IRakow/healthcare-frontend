-- Create patient_uploads table for medical document management
create table if not exists patient_uploads (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references auth.users(id) on delete cascade,
  file_path text not null,
  file_name text not null,
  file_size bigint,
  type text not null check (type in ('lab', 'referral', 'insurance', 'radiology', 'misc')),
  description text,
  tags text[],
  shared_with text[],
  viewed_at timestamp with time zone,
  preview_url text,
  content_type text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create indexes for faster lookups
create index idx_patient_uploads_patient_id on patient_uploads(patient_id);
create index idx_patient_uploads_type on patient_uploads(type);
create index idx_patient_uploads_created_at on patient_uploads(created_at desc);

-- Enable RLS (Row Level Security)
alter table patient_uploads enable row level security;

-- Create policies for patient_uploads
create policy "Patients can view their own uploads"
  on patient_uploads for select
  using (auth.uid() = patient_id);

create policy "Patients can upload their own files"
  on patient_uploads for insert
  with check (auth.uid() = patient_id);

create policy "Patients can update their own uploads"
  on patient_uploads for update
  using (auth.uid() = patient_id);

create policy "Patients can delete their own uploads"
  on patient_uploads for delete
  using (auth.uid() = patient_id);

-- Create trigger to update the updated_at column
create trigger update_patient_uploads_updated_at
  before update on patient_uploads
  for each row
  execute function update_updated_at_column();

-- Create audit_logs table for tracking file access
create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  action text not null,
  resource_type text,
  resource_id uuid,
  details jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone default now()
);

-- Create index for audit logs
create index idx_audit_logs_user_id on audit_logs(user_id);
create index idx_audit_logs_created_at on audit_logs(created_at desc);
create index idx_audit_logs_resource on audit_logs(resource_type, resource_id);

-- Enable RLS for audit_logs
alter table audit_logs enable row level security;

-- Policies for audit_logs
create policy "Users can view their own audit logs"
  on audit_logs for select
  using (auth.uid() = user_id);

create policy "System can insert audit logs"
  on audit_logs for insert
  with check (true);

-- Create storage bucket for uploads if not exists
insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', false)
on conflict (id) do nothing;

-- Create RLS policies for storage bucket
create policy "Users can upload their own files"
  on storage.objects for insert
  with check (bucket_id = 'uploads' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can view their own files"
  on storage.objects for select
  using (bucket_id = 'uploads' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete their own files"
  on storage.objects for delete
  using (bucket_id = 'uploads' and auth.uid()::text = (storage.foldername(name))[1]);

-- Create a view for file statistics
create or replace view patient_upload_stats as
select 
  patient_id,
  count(*) as total_files,
  sum(file_size) as total_size,
  count(distinct type) as file_types,
  max(created_at) as last_upload
from patient_uploads
group by patient_id;

-- Grant access to the view
grant select on patient_upload_stats to authenticated;