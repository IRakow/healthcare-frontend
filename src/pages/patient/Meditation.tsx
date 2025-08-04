// src/pages/patient/Meditation.tsx

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { speak } from '@/lib/voice/RachelTTSQueue';
import { fetchFromGemini } from '@/lib/ai/gemini';
import { supabase } from '@/lib/supabaseClient';
import { useUser } from '@/hooks/useUser';

const voices = ['Bella', 'Adam'];
const moods = ['Calm', 'Focus', 'Sleep', 'Gratitude'];
const durations = [5, 10, 15, 20];

export default function Meditation() {
  const [voice, setVoice] = useState('Rachel');
  const [mood, setMood] = useState('Calm');
  const [duration, setDuration] = useState(10);
  const [session, setSession] = useState('');
  const [playing, setPlaying] = useState(false);
  const { user } = useUser();

  async function generateSession() {
    const prompt = `Create a guided ${duration}-minute meditation for ${mood} using ${voice}'s style. Keep it peaceful, immersive, and non-repetitive.`;
    const res = await fetchFromGemini({ prompt });
    if (res?.text) {
      setSession(res.text);
      speak(`Enjoy your ${mood.toLowerCase()} meditation with ${voice}. I'll be here when you return.`);
      speak(res.text, { voice });
      setPlaying(true);

      // log session to Supabase
      await supabase.from('meditation_sessions').insert({
        user_id: user?.id,
        voice,
        mood,
        duration
      });

      // affirm after session
      const followup = await fetchFromGemini({
        prompt: `Write a one-line affirmation for completing a ${mood.toLowerCase()} meditation.`
      });
      if (followup?.text) speak(followup.text);
    }
  }

  return (
    <div className="min-h-screen p-0 bg-gradient-to-b from-indigo-900 via-blue-950 to-black text-white overflow-hidden">
      <div className="fixed inset-0 z-0 animate-pulse bg-[url('/assets/meditation-bg.svg')] bg-cover opacity-20" />
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6 pb-28 text-center">
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
                {voices.map((v) => (
                  <option key={v}>{v}</option>
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
                  <option key={d}>{d} min</option>
                ))}
              </select>
            </CardContent>
          </Card>
        </div>

        <Button onClick={generateSession} className="bg-blue-500 hover:bg-blue-600 text-white font-semibold text-lg px-6 py-3 rounded-full shadow-xl">
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