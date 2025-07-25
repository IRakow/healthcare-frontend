export interface VoiceRecorderOptions {
  duration?: number; // Recording duration in milliseconds
  mimeType?: string; // MIME type for the recording
}

export function recordVoice(
  onComplete: (blob: Blob) => void,
  options: VoiceRecorderOptions = {}
): Promise<MediaRecorder> {
  const { duration = 5000, mimeType = 'audio/webm' } = options;

  return navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
    const mediaRecorder = new MediaRecorder(stream);
    const chunks: Blob[] = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      onComplete(blob);
      
      // Clean up: stop all tracks
      stream.getTracks().forEach(track => track.stop());
    };

    mediaRecorder.onerror = (e) => {
      console.error('MediaRecorder error:', e);
      stream.getTracks().forEach(track => track.stop());
    };

    mediaRecorder.start();
    
    // Auto-stop after duration
    if (duration > 0) {
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, duration);
    }

    return mediaRecorder;
  });
}

// Helper function to convert blob to base64
export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Helper function to download audio blob
export function downloadAudioBlob(blob: Blob, filename: string = 'recording.webm') {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}