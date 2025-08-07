import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

export function LayeredMeditationPlayer({ voiceSrc, musicSrc }: { voiceSrc: string; musicSrc: string }) {
  const voiceRef = useRef<HTMLAudioElement>(null);
  const musicRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [voiceVol, setVoiceVol] = useState(1);
  const [musicVol, setMusicVol] = useState(0.4);

  useEffect(() => {
    if (voiceRef.current) voiceRef.current.volume = voiceVol;
  }, [voiceVol]);

  useEffect(() => {
    if (musicRef.current) musicRef.current.volume = musicVol;
  }, [musicVol]);

  function play() {
    if (voiceRef.current && musicRef.current) {
      musicRef.current.currentTime = 0;
      voiceRef.current.currentTime = 0;
      musicRef.current.play();
      voiceRef.current.play();
      setPlaying(true);
    }
  }

  function stop() {
    musicRef.current?.pause();
    voiceRef.current?.pause();
    setPlaying(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Button onClick={playing ? stop : play}>
          {playing ? 'Stop' : 'Play Session'}
        </Button>
      </div>

      <div>
        <label className="text-sm font-medium block mb-2">🗣 Voice Volume</label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={voiceVol}
          onChange={(e) => setVoiceVol(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
        />
      </div>

      <div>
        <label className="text-sm font-medium block mb-2">🎵 Music Volume</label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={musicVol}
          onChange={(e) => setMusicVol(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
        />
      </div>

      <audio ref={voiceRef} src={voiceSrc} />
      <audio ref={musicRef} src={musicSrc} loop />
    </div>
  );
}