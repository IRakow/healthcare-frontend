-- Create storage bucket for file uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('files', 'files', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Public files are accessible to everyone" ON storage.objects
FOR SELECT USING (bucket_id = 'files');

CREATE POLICY "Authenticated users can upload files" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'files' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own files" ON storage.objects
FOR UPDATE USING (bucket_id = 'files' AND auth.uid() = owner);

CREATE POLICY "Users can delete their own files" ON storage.objects
FOR DELETE USING (bucket_id = 'files' AND auth.uid() = owner);