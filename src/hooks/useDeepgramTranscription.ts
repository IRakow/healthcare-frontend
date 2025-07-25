import { useEffect, useRef, useState } from 'react';
import { saveTranscriptLine } from '@/utils/transcriptUtils';

interface DeepgramTranscriptionConfig {
  appointmentId: string;
  speaker: 'patient' | 'provider';
  onTranscript?: (text: string) => void;
}

export function useDeepgramTranscription({ appointmentId, speaker, onTranscript }: DeepgramTranscriptionConfig) {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const websocketRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Initialize Deepgram WebSocket
      const ws = new WebSocket(
        `wss://api.deepgram.com/v1/listen?encoding=linear16&sample_rate=16000&language=en-US`,
        ['token', process.env.VITE_DEEPGRAM_API_KEY || '']
      );

      ws.onopen = () => {
        console.log('Deepgram connection opened');
        setIsRecording(true);
      };

      ws.onmessage = async (event) => {
        const msg = JSON.parse(event.data);
        
        // Check for finalized transcript
        const final = msg.channel?.alternatives?.[0]?.transcript;
        if (final && final.length > 0) {
          // Save to database
          await saveTranscriptLine(appointmentId, speaker, final);
          
          // Callback for UI updates
          if (onTranscript) {
            onTranscript(final);
          }
        }
      };

      ws.onerror = (error) => {
        console.error('Deepgram error:', error);
        setError('Transcription error occurred');
      };

      ws.onclose = () => {
        console.log('Deepgram connection closed');
        setIsRecording(false);
      };

      // Set up MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
          ws.send(event.data);
        }
      };

      mediaRecorder.start(250); // Send data every 250ms

      websocketRef.current = ws;
      mediaRecorderRef.current = mediaRecorder;

    } catch (err) {
      console.error('Failed to start recording:', err);
      setError('Failed to access microphone');
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }

    if (websocketRef.current) {
      websocketRef.current.close();
    }

    setIsRecording(false);
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, []);

  return {
    isRecording,
    error,
    startRecording,
    stopRecording
  };
}