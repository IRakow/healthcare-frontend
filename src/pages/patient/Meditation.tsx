import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { fetchFromGemini } from '@/lib/ai/gemini';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/hooks/useUser';
import { speak } from '@/lib/voice/RachelTTSQueue';

const voices = {
  Female: ['Bella', 'Arabella', 'Ana-Rita', 'Amelia'],
  Male: ['Adam', 'Archimedes', 'Michael']
};

const moods = ['Calm', 'Focus', 'Sleep', 'Gratitude'];
const durations = [5, 10, 15, 20];

const moodBackgrounds: Record<string, string> = {
  Calm: '/assets/meditation-mountains.jpg',
  Focus: '/assets/meditation-forest.jpg',
  Sleep: '/assets/meditation-ocean.jpg',
  Gratitude: '/assets/meditation-forest.jpg'
};

export default function Meditation() {
  const [voice, setVoice] = useState('Bella');
  const [mood, setMood] = useState('Calm');
  const [duration, setDuration] = useState(10);
  const [session, setSession] = useState('');
  const [playing, setPlaying] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.5);
  const [silentMode, setSilentMode] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { user } = useUser();

  useEffect(() => {
    const saved = localStorage.getItem('silent_mode');
    setSilentMode(saved === 'true');
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = musicVolume;
    }
  }, [musicVolume]);

  async function generateSession() {
    const prompt = `Create a guided ${duration}-minute meditation for ${mood} using ${voice}'s style. Keep it peaceful, immersive, and non-repetitive.`;
    const res = await fetchFromGemini({ prompt });
    if (res?.text) {
      setSession(res.text);
      setPlaying(true);

      await supabase.from('meditation_sessions').insert({
        user_id: user?.id,
        voice,
        mood,
        duration
      });

      if (!silentMode) speak(res.text, voice);
    }
  }

  return (
    <div
      className="min-h-screen text-white overflow-hidden bg-black"
      style={{
        backgroundImage: `url(${moodBackgrounds[mood]})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      <audio
        ref={audioRef}
        src={`/audio/${mood.toLowerCase()}.mp3`}
        autoPlay
        loop
        className="hidden"
      />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6 pb-28 text-center backdrop-blur-[2px]">
        <h1 className="text-4xl font-bold mb-4 drop-shadow-md">🧘‍♀️ Your Sanctuary</h1>
        <p className="text-sm text-blue-200 mb-6">Breathe in. Let's create your personalized meditation session.</p>

        <div className="grid gap-4 sm:grid-cols-3 text-sm mb-6 w-full max-w-2xl">
          <Card className="bg-white/10">
            <CardContent className="p-4">
              <label className="block mb-2">Voice</label>
              <select
                className="w-full p-2 bg-black/20 text-white rounded-md"
                value={voice}
                onChange={(e) => setVoice(e.target.value)}
              >
                {Object.entries(voices).map(([gender, list]) => (
                  <optgroup key={gender} label={gender}>
                    {list.map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </CardContent>
          </Card>

          <Card className="bg-white/10">
            <CardContent className="p-4">
              <label className="block mb-2">Mood</label>
              <select
                className="w-full p-2 bg-black/20 text-white rounded-md"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
              >
                {moods.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </CardContent>
          </Card>

          <Card className="bg-white/10">
            <CardContent className="p-4">
              <label className="block mb-2">Duration</label>
              <select
                className="w-full p-2 bg-black/20 text-white rounded-md"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              >
                {durations.map((d) => (
                  <option key={d} value={d}>{d} min</option>
                ))}
              </select>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col items-center space-y-4 mb-6">
          <label className="text-xs text-blue-200">🎵 Music Volume</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={musicVolume}
            onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
            className="w-48"
          />
        </div>

        <Button
          onClick={generateSession}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold text-lg px-6 py-3 rounded-full shadow-xl"
        >
          {playing ? 'Restart Meditation' : 'Begin Meditation'}
        </Button>

        {session && (
          <div className="mt-10 max-w-2xl text-left bg-white/10 p-6 rounded-lg backdrop-blur-md shadow-lg text-sm leading-relaxed text-blue-100 whitespace-pre-wrap">
            {session}
          </div>
        )}
      </div>
    </div>
  );
}