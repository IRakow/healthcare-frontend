import { supabase } from '@/lib/supabase';

export async function streamToAI(audioBlob: Blob, callback: (text: string) => void): Promise<void> {
  // Convert blob to base64
  const reader = new FileReader();
  
  reader.onloadend = async () => {
    const base64Audio = reader.result?.toString().split(',')[1]; // Remove data:audio/webm;base64, prefix
    
    if (!base64Audio) {
      callback('Error: Could not process audio');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('voice-to-text', {
        body: { 
          audioBlob: base64Audio,
          mimeType: audioBlob.type 
        }
      });

      if (error) throw error;
      
      callback(data.transcript || 'No transcription available');
    } catch (error) {
      console.error('[streamToAI] Error:', error);
      callback('Error transcribing audio');
    }
  };

  reader.readAsDataURL(audioBlob);
}