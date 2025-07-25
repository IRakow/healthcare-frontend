import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, MicOff, User, Stethoscope } from 'lucide-react';
import { useDeepgramTranscription } from '@/hooks/useDeepgramTranscription';

interface TranscriptionControlsProps {
  appointmentId: string;
}

export function TranscriptionControls({ appointmentId }: TranscriptionControlsProps) {
  const [speaker, setSpeaker] = useState<'patient' | 'provider'>('provider');
  const [recentTranscripts, setRecentTranscripts] = useState<string[]>([]);

  const { isRecording, error, startRecording, stopRecording } = useDeepgramTranscription({
    appointmentId,
    speaker,
    onTranscript: (text) => {
      // Keep last 5 transcripts for display
      setRecentTranscripts(prev => [...prev.slice(-4), text]);
    }
  });

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Live Transcription</h3>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={speaker === 'provider' ? 'default' : 'outline'}
              onClick={() => setSpeaker('provider')}
            >
              <Stethoscope className="h-4 w-4 mr-1" />
              Provider
            </Button>
            <Button
              size="sm"
              variant={speaker === 'patient' ? 'default' : 'outline'}
              onClick={() => setSpeaker('patient')}
            >
              <User className="h-4 w-4 mr-1" />
              Patient
            </Button>
          </div>
        </div>

        <Button
          onClick={isRecording ? stopRecording : startRecording}
          variant={isRecording ? 'destructive' : 'default'}
          className="w-full"
        >
          {isRecording ? (
            <>
              <MicOff className="h-4 w-4 mr-2" />
              Stop Recording
            </>
          ) : (
            <>
              <Mic className="h-4 w-4 mr-2" />
              Start Recording as {speaker}
            </>
          )}
        </Button>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        {recentTranscripts.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">Recent transcripts:</p>
            {recentTranscripts.map((text, i) => (
              <p key={i} className="text-sm p-2 bg-gray-50 rounded">
                [{speaker.toUpperCase()}]: {text}
              </p>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}