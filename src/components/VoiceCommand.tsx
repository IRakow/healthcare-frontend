import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { handleCommand } from '@/utils/commandHandler';
import { recordVoice } from '@/utils/simpleVoiceRecorder';

export function VoiceCommand() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const navigate = useNavigate();

  const handleVoiceCommand = () => {
    if (isListening) return;

    setIsListening(true);
    setTranscript('');

    recordVoice(async (blob) => {
      try {
        // Transcribe the audio
        const formData = new FormData();
        formData.append('audio', blob);

        const res = await fetch(`${import.meta.env.VITE_SUPABASE_FN_BASE}/deepgram-transcribe`, {
          method: 'POST',
          body: formData,
        });

        const json = await res.json();
        const text = json.results?.channels?.[0]?.alternatives?.[0]?.transcript || 
                     json.transcript || 
                     json.text || 
                     '';

        setTranscript(text);

        // Handle the command
        if (text) {
          const success = handleCommand(text, navigate);
          if (!success) {
            alert(`Command not recognized: "${text}"`);
          }
        }
      } catch (error) {
        console.error('Voice command error:', error);
        alert('Failed to process voice command');
      } finally {
        setIsListening(false);
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={handleVoiceCommand}
        disabled={isListening}
        variant="secondary"
        className={isListening ? 'animate-pulse' : ''}
        title="Voice command (5 seconds)"
      >
        {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
      </Button>
      {transcript && (
        <span className="text-sm text-gray-600">"{transcript}"</span>
      )}
    </div>
  );
}