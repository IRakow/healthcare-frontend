import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Toast } from '@/components/ui/Toast';
import { Upload } from 'lucide-react';

interface FileUploadWithTimelineProps {
  patientId: string;
  onUploadSuccess?: () => void;
}

export default function FileUploadWithTimeline({ patientId, onUploadSuccess }: FileUploadWithTimelineProps) {
  const [uploading, setUploading] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      // Upload file to Supabase Storage
      const fileName = `${patientId}/${Date.now()}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('patient-files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('patient-files')
        .getPublicUrl(fileName);

      // Log to patient timeline
      await supabase.from('patient_timeline_events').insert({
        patient_id: patientId,
        type: 'upload',
        label: file.name,
        data: { url: publicUrl, fileName: file.name, fileSize: file.size },
      });

      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);

      if (onUploadSuccess) {
        onUploadSuccess();
      }

      // Reset file input
      event.target.value = '';
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <div className="relative">
        <input
          type="file"
          id="file-upload"
          className="hidden"
          onChange={handleFileUpload}
          disabled={uploading}
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
        />
        <label htmlFor="file-upload">
          <Button
            variant="secondary"
            className="cursor-pointer"
            onClick={(e) => e.preventDefault()}
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload File'}
          </Button>
        </label>
      </div>
      {showToast && <Toast message="File uploaded successfully!" />}
    </>
  );
}

// Example usage in a component:
/*
import FileUploadWithTimeline from '@/components/patient/FileUploadWithTimeline';

function PatientDashboard() {
  const { data: { user } } = await supabase.auth.getUser();
  
  return (
    <div>
      <h2>Upload Medical Documents</h2>
      <FileUploadWithTimeline 
        patientId={user?.id} 
        onUploadSuccess={() => {
          // Refresh timeline or do something else
        }}
      />
    </div>
  );
}
*/