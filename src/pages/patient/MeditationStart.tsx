import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient';

export default function MeditationStart() {
  const location = useLocation();
  const navigate = useNavigate();
  const type = new URLSearchParams(location.search).get('type') || 'calm';
  const [playing, setPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Fetch ElevenLabs voice intro
    async function playIntro() {
      if (type === 'ambient') return;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/eleven-speak`, {
          method: 'POST',
          body: JSON.stringify({
            text: `Welcome. This is a ${type} meditation. Let's begin. Take a deep breath in... and slowly exhale.`,
          }),
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`
          },
        });

        if (res.ok) {
          const audioBuffer = await res.arrayBuffer();
          const ctx = new AudioContext();
          const decoded = await ctx.decodeAudioData(audioBuffer);
          const source = ctx.createBufferSource();
          source.buffer = decoded;
          source.connect(ctx.destination);
          source.start();
        }
      } catch (error) {
        console.error('Error playing intro:', error);
      }
    }

    playIntro();
  }, [type]);

  function startMusic() {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }

    const newAudio = new Audio(`/meditations/${type}.mp3`);
    newAudio.volume = 0.8;
    newAudio.loop = true;
    newAudio.play();
    
    setAudio(newAudio);
    setPlaying(true);
  }

  function stopMusic() {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setPlaying(false);
  }

  return (
    <div className="p-6 max-w-xl mx-auto text-center space-y-6">
      <Button 
        variant="ghost" 
        className="mb-4 self-start"
        onClick={() => navigate('/patient/meditation')}
      >
        ← Back
      </Button>
      
      <h1 className="text-2xl font-semibold text-blue-700">
        🧘 {type.charAt(0).toUpperCase() + type.slice(1)} Session
      </h1>
      <p className="text-gray-600">Sit comfortably. Breathe deeply. Begin when ready.</p>
      
      <div className="space-x-4">
        {!playing ? (
          <Button onClick={startMusic} size="lg">Start Session</Button>
        ) : (
          <>
            <Button onClick={stopMusic} variant="outline" size="lg">Stop</Button>
            <Button onClick={() => navigate('/patient/meditation')} variant="ghost">
              Choose Another
            </Button>
          </>
        )}
      </div>

      {playing && (
        <div className="mt-8 animate-pulse">
          <div className="w-32 h-32 mx-auto rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-4xl">🧘</span>
          </div>
          <p className="mt-4 text-sm text-gray-500">Session in progress...</p>
        </div>
      )}
    </div>
  );
}