import { useState, useRef, useCallback } from 'react';
import { voiceAPI } from '@/services/voiceAPI';
import { aiLoggingService } from '@/services/aiLoggingService';

export function useVoiceAssistant() {
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Start recording audio
  const startRecording = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsListening(true);
    } catch (err) {
      setError('Failed to start recording. Please ensure microphone permissions are granted.');
      console.error('Recording error:', err);
    }
  }, []);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  }, []);

  // Process recorded audio
  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    const startTime = Date.now();
    
    try {
      // Transcribe audio using Deepgram
      const transcribedText = await voiceAPI.transcribeAudio(audioBlob);
      setTranscript(transcribedText);
      
      // Log the transcription
      await aiLoggingService.logVoiceTranscription(
        transcribedText,
        Math.round((Date.now() - startTime) / 1000)
      );

      // Get AI response
      let fullResponse = '';
      const aiStartTime = Date.now();
      
      await voiceAPI.streamAIResponse(
        transcribedText,
        async (chunk) => {
          fullResponse += chunk;
          setResponse(fullResponse);
          
          // Convert meaningful chunks to speech
          if (chunk.length > 10) {
            try {
              const audioBuffer = await voiceAPI.textToSpeech(chunk);
              playAudio(audioBuffer);
            } catch (err) {
              console.error('Text-to-speech error:', err);
            }
          }
        }
      );
      
      // Log the AI query
      await aiLoggingService.logQuery(
        'ChatGPT',
        transcribedText,
        fullResponse,
        'Rachel' // Default voice - could be made configurable
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Play audio buffer
  const playAudio = (buffer: ArrayBuffer) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    
    audioContextRef.current.decodeAudioData(buffer.slice(0), (decoded) => {
      const source = audioContextRef.current!.createBufferSource();
      source.buffer = decoded;
      source.connect(audioContextRef.current!.destination);
      source.start(0);
    });
  };

  // Direct text query (without recording)
  const queryText = async (text: string) => {
    setIsProcessing(true);
    setError(null);
    setTranscript(text);
    
    try {
      let fullResponse = '';
      await voiceAPI.streamAIResponse(
        text,
        async (chunk) => {
          fullResponse += chunk;
          setResponse(fullResponse);
        }
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    transcript,
    response,
    isListening,
    isProcessing,
    error,
    startRecording,
    stopRecording,
    queryText,
  };
}