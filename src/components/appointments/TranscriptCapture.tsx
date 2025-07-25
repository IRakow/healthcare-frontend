import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, MicOff, Save, Loader2 } from 'lucide-react';
import Spinner from '@/components/ui/spinner';

interface TranscriptCaptureProps {
  appointmentId: string;
  patientId: string;
  onSave?: () => void;
}

export function TranscriptCapture({ appointmentId, patientId, onSave }: TranscriptCaptureProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Speech recognition for real-time transcription
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) return;

    const SpeechRecognition = window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript + ' ';
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      if (finalTranscript) {
        setTranscript(prev => prev + finalTranscript);
      }
    };

    if (isRecording) {
      recognition.start();
    } else {
      recognition.stop();
    }

    return () => {
      recognition.stop();
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start(1000); // Collect data every second
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Failed to start recording. Please check microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const saveTranscript = async () => {
    if (!transcript.trim()) {
      alert('No transcript to save');
      return;
    }

    setIsSaving(true);
    setIsProcessing(true);

    try {
      // Get AI summary of the transcript
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
      
      // Call edge function to generate summary
      const summaryRes = await fetch(`${supabaseUrl}/functions/v1/ai-summarize-transcript`, {
        method: 'POST',
        body: JSON.stringify({ 
          transcript: transcript,
          appointmentId: appointmentId
        }),
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      let geminiSummary = 'Summary not available';
      
      if (summaryRes.ok) {
        const data = await summaryRes.json();
        geminiSummary = data.summary || 'Summary not available';
      }

      // Save to timeline
      await supabase.from('patient_timeline_events').insert({
        patient_id: patientId,
        type: 'ai',
        label: 'Visit Transcript',
        data: {
          appointment_id: appointmentId,
          summary: geminiSummary,
          rawTranscript: transcript,
          duration: Math.floor(transcript.split(' ').length / 150), // Rough estimate of minutes
          timestamp: new Date().toISOString()
        }
      });

      alert('Transcript saved successfully!');
      
      if (onSave) {
        onSave();
      }

      // Clear transcript
      setTranscript('');
      chunksRef.current = [];
    } catch (error) {
      console.error('Error saving transcript:', error);
      alert('Failed to save transcript. Please try again.');
    } finally {
      setIsSaving(false);
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <div className="p-4">
        <h3 className="font-semibold mb-4">Visit Transcript</h3>
        
        <div className="space-y-4">
          {/* Recording Controls */}
          <div className="flex gap-2">
            {!isRecording ? (
              <Button onClick={startRecording} variant="outline" size="sm">
                <Mic className="h-4 w-4 mr-2" />
                Start Recording
              </Button>
            ) : (
              <Button onClick={stopRecording} variant="outline" size="sm" className="text-red-600">
                <MicOff className="h-4 w-4 mr-2" />
                Stop Recording
              </Button>
            )}
            
            <Button 
              onClick={saveTranscript} 
              disabled={!transcript.trim() || isSaving}
              size="sm"
            >
              {isSaving ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  {isProcessing ? 'Processing...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Transcript
                </>
              )}
            </Button>
          </div>

          {/* Transcript Display */}
          <div className="bg-gray-50 rounded-lg p-3 min-h-[100px] max-h-[200px] overflow-y-auto">
            {transcript ? (
              <p className="text-sm whitespace-pre-wrap">{transcript}</p>
            ) : (
              <p className="text-sm text-gray-500 italic">
                {isRecording ? 'Listening...' : 'Click "Start Recording" to begin transcription'}
              </p>
            )}
          </div>

          {/* Word Count */}
          {transcript && (
            <p className="text-xs text-gray-500">
              Word count: {transcript.split(' ').filter(w => w.trim()).length}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}