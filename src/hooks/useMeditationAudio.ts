// File: src/hooks/useMeditationAudio.ts
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface MeditationOptions {
  topic: string;
  voice?: string;
  includeMusic?: boolean;
  model?: 'gemini' | 'openai';
  duration?: number;
}

export function useMeditationAudio() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [meditationText, setMeditationText] = useState('');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateMeditation = async (options: MeditationOptions) => {
    setIsGenerating(true);
    setError(null);
    setMeditationText('');
    setAudioUrl(null);

    try {
      const { data, error: funcError } = await supabase.functions.invoke('generate-meditation-audio', {
        body: {
          topic: options.topic,
          voice: options.voice || 'Bella',
          includeMusic: options.includeMusic ?? true,
          model: options.model || 'gemini',
          duration: options.duration || 10
        }
      });

      if (funcError) {
        throw new Error(funcError.message);
      }

      if (data) {
        setMeditationText(data.text);
        setAudioUrl(data.audio_url);

        // If music is requested, we can mix it client-side
        if (data.includeMusic && data.audio_url) {
          // Play background music softly
          const bgMusic = new Audio('/audio/calm.mp3');
          bgMusic.volume = 0.2;
          bgMusic.loop = true;
          
          // Play the meditation voice
          const voice = new Audio(data.audio_url);
          voice.volume = 1.0;
          
          // Start both
          voice.play();
          bgMusic.play();
          
          // Stop music when voice ends
          voice.addEventListener('ended', () => {
            bgMusic.pause();
            bgMusic.currentTime = 0;
          });
        }
      }
    } catch (err: any) {
      console.error('Error generating meditation:', err);
      setError(err.message || 'Failed to generate meditation');
    } finally {
      setIsGenerating(false);
    }
  };

  const playAudio = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  const stopAudio = () => {
    // Stop all audio elements on the page
    document.querySelectorAll('audio').forEach(audio => {
      (audio as HTMLAudioElement).pause();
      (audio as HTMLAudioElement).currentTime = 0;
    });
  };

  return {
    generateMeditation,
    playAudio,
    stopAudio,
    isGenerating,
    meditationText,
    audioUrl,
    error
  };
}