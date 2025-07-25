import { useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface TTSOptions {
  voice?: string;
  model?: string;
  stream?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: Error) => void;
}

export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  const speak = useCallback(async (text: string, options: TTSOptions = {}) => {
    const {
      voice = 'rachel',
      model = 'eleven_monolingual_v1',
      stream = false,
      onStart,
      onEnd,
      onError
    } = options;

    try {
      setIsLoading(true);
      
      const supabaseUrl = (supabase as any).supabaseUrl || import.meta.env.VITE_SUPABASE_URL;
      const functionName = stream ? 'eleven-speak-stream' : 'eleven-speak';
      
      const response = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(supabase as any).supabaseKey || import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ text, voice, model, stream })
      });

      if (!response.ok) {
        throw new Error(`TTS request failed: ${response.statusText}`);
      }

      setIsLoading(false);
      setIsSpeaking(true);
      onStart?.();

      if (stream) {
        // Handle streaming audio
        const reader = response.body!.getReader();
        const chunks: Uint8Array[] = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          
          // Play chunks as they arrive for lower latency
          if (chunks.length === 1) {
            playAudioChunks(chunks);
          }
        }
      } else {
        // Handle complete audio
        const audioBuffer = await response.arrayBuffer();
        await playAudio(audioBuffer);
      }

      setIsSpeaking(false);
      onEnd?.();
    } catch (error) {
      setIsLoading(false);
      setIsSpeaking(false);
      onError?.(error as Error);
      console.error('TTS Error:', error);
    }
  }, []);

  const playAudio = useCallback(async (buffer: ArrayBuffer) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }

    try {
      const audioBuffer = await audioContextRef.current.decodeAudioData(buffer);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      
      source.onended = () => {
        setIsSpeaking(false);
        sourceNodeRef.current = null;
      };

      sourceNodeRef.current = source;
      source.start(0);
    } catch (error) {
      console.error('Audio playback error:', error);
      setIsSpeaking(false);
    }
  }, []);

  const playAudioChunks = useCallback(async (chunks: Uint8Array[]) => {
    const combined = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
    let offset = 0;
    for (const chunk of chunks) {
      combined.set(chunk, offset);
      offset += chunk.length;
    }
    await playAudio(combined.buffer);
  }, [playAudio]);

  const stop = useCallback(() => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current = null;
      setIsSpeaking(false);
    }
  }, []);

  return {
    speak,
    stop,
    isSpeaking,
    isLoading
  };
}