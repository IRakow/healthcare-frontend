-- Create storage bucket for patient media
insert into storage.buckets (id, name, public)
values ('patient-media', 'patient-media', true);

-- Storage policies for patient-media bucket

-- Patients can upload their own media
create policy "Patients can upload own media"
on storage.objects for insert
with check (
  bucket_id = 'patient-media' 
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Patients can view their own media
create policy "Patients can view own media"
on storage.objects for select
using (
  bucket_id = 'patient-media'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Providers can view all patient media
create policy "Providers can view all media"
on storage.objects for select
using (
  bucket_id = 'patient-media'
  and exists (
    select 1 from users
    where users.id = auth.uid()
    and users.role = 'provider'
  )
);

-- Public access for AI analysis (if bucket is public)
-- No additional policy needed as bucket is public

-- Alternative: If you want to keep bucket private and use signed URLs
-- Remove the public: true from bucket creation and use:
-- const { data } = await supabase.storage
--   .from('patient-media')
--   .createSignedUrl(path, 3600); // 1 hour expiry