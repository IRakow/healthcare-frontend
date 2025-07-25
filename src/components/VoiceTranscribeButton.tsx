import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Loader2 } from 'lucide-react';
import { recordVoice } from '@/utils/voiceRecorder';

interface VoiceTranscribeButtonProps {
  onTranscription: (text: string) => void;
  duration?: number;
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
}

export default function VoiceTranscribeButton({
  onTranscription,
  duration = 5000,
  variant = 'secondary',
  className = ''
}: VoiceTranscribeButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const handleClick = () => {
    if (isRecording || isTranscribing) return;

    setIsRecording(true);
    
    recordVoice(async (blob) => {
      setIsRecording(false);
      setIsTranscribing(true);

      try {
        const formData = new FormData();
        formData.append('audio', blob, 'recording.webm');

        const response = await fetch(`${import.meta.env.VITE_SUPABASE_FN_BASE}/deepgram-transcribe`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Transcription failed: ${response.statusText}`);
        }

        const json = await response.json();
        const transcription = json.results?.channels?.[0]?.alternatives?.[0]?.transcript || 
                             json.transcript || 
                             json.text || 
                             '';
        
        if (transcription) {
          onTranscription(transcription);
        } else {
          console.error('No transcription found in response:', json);
          alert('Could not transcribe audio. Please try again.');
        }
      } catch (error) {
        console.error('Transcription error:', error);
        alert('Failed to transcribe audio. Please try again.');
      } finally {
        setIsTranscribing(false);
      }
    }, { duration });
  };

  return (
    <Button
      variant={variant}
      onClick={handleClick}
      disabled={isRecording || isTranscribing}
      className={`${className} ${isRecording ? 'animate-pulse' : ''}`}
    >
      {isRecording ? (
        <>
          <Mic className="w-4 h-4 mr-2 animate-pulse" />
          Recording...
        </>
      ) : isTranscribing ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Transcribing...
        </>
      ) : (
        <Mic className="w-4 h-4" />
      )}
    </Button>
  );
}