import { supabase } from '@/lib/supabaseClient';

export interface UploadedFile {
  id?: string;
  patient_id: string;
  filename: string;
  url: string;
  type: string;
  created_at?: string;
}

export const fileCategories = [
  { value: 'lab_result', label: 'Lab Result' },
  { value: 'imaging', label: 'Imaging/Scan' },
  { value: 'prescription', label: 'Prescription' },
  { value: 'insurance', label: 'Insurance Document' },
  { value: 'medical_record', label: 'Medical Record' },
  { value: 'vaccination', label: 'Vaccination Record' },
  { value: 'other', label: 'Other' }
] as const;

export type FileCategory = typeof fileCategories[number]['value'];

class FileUploadService {
  private bucketName = 'patient-uploads';

  async uploadFile(
    file: File,
    patientId: string,
    category: FileCategory,
    description?: string
  ): Promise<{ success: boolean; data?: UploadedFile; error?: string }> {
    try {
      // Validate file
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        return { success: false, error: 'File size exceeds 10MB limit' };
      }

      // Allowed file types
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];

      if (!allowedTypes.includes(file.type)) {
        return { success: false, error: 'File type not allowed' };
      }

      // Generate unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${patientId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(this.bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return { success: false, error: 'Failed to upload file' };
      }

      // Save file metadata to database using the uploads table structure
      const fileRecord: Omit<UploadedFile, 'id' | 'created_at'> = {
        patient_id: patientId,
        filename: file.name,
        url: fileName, // Store the path in the url field
        type: category // Use category as the type
      };

      const { data: dbData, error: dbError } = await supabase
        .from('uploads')
        .insert(fileRecord)
        .select()
        .single();

      if (dbError) {
        // If database insert fails, delete the uploaded file
        await supabase.storage.from(this.bucketName).remove([fileName]);
        console.error('Database error:', dbError);
        return { success: false, error: 'Failed to save file information' };
      }

      // Create timeline event
      await supabase.from('patient_timeline_events').insert({
        patient_id: patientId,
        type: 'upload',
        label: `Uploaded ${this.getCategoryLabel(category)}: ${file.name}`,
        data: {
          url: fileName,
          type: file.type
        }
      });

      return { success: true, data: dbData };
    } catch (error) {
      console.error('Upload error:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  async getFiles(patientId: string, category?: FileCategory) {
    try {
      let query = supabase
        .from('uploads')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (category) {
        query = query.eq('type', category);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching files:', error);
      return { success: false, error: 'Failed to fetch files' };
    }
  }

  async getFileUrl(filePath: string, expiresIn = 3600) {
    try {
      const { data, error } = await supabase.storage
        .from(this.bucketName)
        .createSignedUrl(filePath, expiresIn);

      if (error) throw error;
      return { success: true, url: data.signedUrl };
    } catch (error) {
      console.error('Error getting file URL:', error);
      return { success: false, error: 'Failed to get file URL' };
    }
  }

  async deleteFile(fileId: string, filePath: string, patientId: string) {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from(this.bucketName)
        .remove([filePath]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('uploads')
        .delete()
        .eq('id', fileId)
        .eq('patient_id', patientId); // Extra safety check

      if (dbError) throw dbError;

      // Create timeline event
      await supabase.from('patient_timeline_events').insert({
        patient_id: patientId,
        type: 'update',
        label: 'Deleted uploaded file',
        data: { file_id: fileId }
      });

      return { success: true };
    } catch (error) {
      console.error('Error deleting file:', error);
      return { success: false, error: 'Failed to delete file' };
    }
  }

  private getCategoryLabel(category: FileCategory): string {
    const found = fileCategories.find(c => c.value === category);
    return found ? found.label : 'Document';
  }
}

export const fileUploadService = new FileUploadService();