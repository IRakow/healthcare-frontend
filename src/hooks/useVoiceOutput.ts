// File: src/hooks/useVoiceOutput.ts

import { useEffect, useRef } from 'react';

interface Props {
  voiceId?: string;
}

export function useVoiceOutput({ voiceId }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  async function speak(text: string) {
    if (!voiceId || !text) return;
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voiceId })
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    if (audioRef.current) {
      audioRef.current.pause();
    } else {
      audioRef.current = new Audio();
    }
    audioRef.current.src = url;
    audioRef.current.play();
  }

  return { speak };
}