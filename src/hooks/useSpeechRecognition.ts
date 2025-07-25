import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface TranscriptionResult {
  transcript: string;
  isFinal: boolean;
  confidence: number;
}

interface UseSpeechRecognitionOptions {
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
  onResult?: (result: TranscriptionResult) => void;
  onError?: (error: Error) => void;
}

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const {
    continuous = false,
    interimResults = true,
    language = 'en-US',
    onResult,
    onError
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState<Error | null>(null);
  
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const webSocketRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  // Use native Web Speech API if available
  const useNativeSpeechRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      return false;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = language;

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      if (finalTranscript) {
        setTranscript(prev => prev + ' ' + finalTranscript);
        onResult?.({
          transcript: finalTranscript,
          isFinal: true,
          confidence: event.results[event.results.length - 1][0].confidence
        });
      }

      setInterimTranscript(interimTranscript);
      if (interimTranscript && interimResults) {
        onResult?.({
          transcript: interimTranscript,
          isFinal: false,
          confidence: 0
        });
      }
    };

    recognition.onerror = (event) => {
      const error = new Error(`Speech recognition error: ${event.error}`);
      setError(error);
      onError?.(error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    setIsListening(true);
    
    return () => {
      recognition.stop();
    };
  }, [continuous, interimResults, language, onResult, onError]);

  // Use Deepgram WebSocket for real-time transcription
  const useDeepgramTranscription = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const supabaseUrl = (supabase as any).supabaseUrl || import.meta.env.VITE_SUPABASE_URL;
      const wsUrl = supabaseUrl.replace('https://', 'wss://') + '/functions/v1/deepgram-stream';
      
      const ws = new WebSocket(wsUrl);
      webSocketRef.current = ws;

      ws.onopen = () => {
        console.log('Connected to Deepgram');
        setIsListening(true);

        // Set up audio processing
        audioContextRef.current = new AudioContext();
        const source = audioContextRef.current.createMediaStreamSource(stream);
        const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
        processorRef.current = processor;

        processor.onaudioprocess = (e) => {
          if (ws.readyState === WebSocket.OPEN) {
            const inputData = e.inputBuffer.getChannelData(0);
            const downsampledData = downsample(inputData, audioContextRef.current!.sampleRate, 16000);
            const int16Data = convertFloat32ToInt16(downsampledData);
            ws.send(int16Data);
          }
        };

        source.connect(processor);
        processor.connect(audioContextRef.current.destination);
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        const result = data.channel?.alternatives?.[0];
        
        if (result) {
          if (data.is_final) {
            const finalText = result.transcript;
            setTranscript(prev => prev + ' ' + finalText);
            setInterimTranscript('');
            onResult?.({
              transcript: finalText,
              isFinal: true,
              confidence: result.confidence || 0
            });
          } else {
            setInterimTranscript(result.transcript);
            if (interimResults) {
              onResult?.({
                transcript: result.transcript,
                isFinal: false,
                confidence: result.confidence || 0
              });
            }
          }
        }
      };

      ws.onerror = (event) => {
        const error = new Error('WebSocket error');
        setError(error);
        onError?.(error);
        cleanup();
      };

      ws.onclose = () => {
        cleanup();
      };

    } catch (err) {
      const error = err as Error;
      setError(error);
      onError?.(error);
      setIsListening(false);
    }
  }, [interimResults, onResult, onError]);

  // Helper functions for audio processing
  const downsample = (buffer: Float32Array, fromSampleRate: number, toSampleRate: number): Float32Array => {
    if (fromSampleRate === toSampleRate) {
      return buffer;
    }
    const sampleRateRatio = fromSampleRate / toSampleRate;
    const newLength = Math.round(buffer.length / sampleRateRatio);
    const result = new Float32Array(newLength);
    let offsetResult = 0;
    let offsetBuffer = 0;
    while (offsetResult < result.length) {
      const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
      let accum = 0;
      let count = 0;
      for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
        accum += buffer[i];
        count++;
      }
      result[offsetResult] = accum / count;
      offsetResult++;
      offsetBuffer = nextOffsetBuffer;
    }
    return result;
  };

  const convertFloat32ToInt16 = (buffer: Float32Array): ArrayBuffer => {
    const l = buffer.length;
    const buf = new ArrayBuffer(l * 2);
    const view = new DataView(buf);
    let i = 0;
    while (i < l) {
      const s = Math.max(-1, Math.min(1, buffer[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      i++;
    }
    return buf;
  };

  const cleanup = () => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (webSocketRef.current) {
      webSocketRef.current.close();
      webSocketRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsListening(false);
  };

  const start = useCallback(async () => {
    setTranscript('');
    setInterimTranscript('');
    setError(null);

    // Try native speech recognition first
    const cleanup = useNativeSpeechRecognition();
    if (cleanup) {
      return cleanup;
    }

    // Fall back to Deepgram
    await useDeepgramTranscription();
    return cleanup;
  }, [useNativeSpeechRecognition, useDeepgramTranscription]);

  const stop = useCallback(() => {
    cleanup();
  }, []);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  return {
    start,
    stop,
    isListening,
    transcript,
    interimTranscript,
    error,
    reset: () => {
      setTranscript('');
      setInterimTranscript('');
      setError(null);
    }
  };
}