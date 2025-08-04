// src/pages/patient/MeditationImmersive.tsx

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { fetchFromGemini } from '@/lib/ai/gemini';
import { speak } from '@/lib/voice/RachelTTSQueue';
import { SparklesCore } from '@/components/ui/visuals/SparklesCore';

const voices = {
  Female: ['Bella', 'Arabella', 'Ana-Rita', 'Amelia'],
  Male: ['Adam', 'Archimedes', 'Michael']
};

const moods = ['Calm', 'Focus', 'Sleep', 'Gratitude'];
const durations = [5, 10, 15, 20];

const moodBackgrounds: Record<string, string> = {
  Calm: '/images/meditation-mountains.jpg',
  Focus: '/images/meditation-forest.jpg',
  Sleep: '/images/meditation-ocean.jpg',
  Gratitude: '/images/meditation-sky.jpg'
};

export default function MeditationImmersive() {
  const [voice, setVoice] = useState('Bella');
  const [mood, setMood] = useState('Calm');
  const [duration, setDuration] = useState(10);
  const [session, setSession] = useState('');
  const [playing, setPlaying] = useState(false);
  const [silentMode, setSilentMode] = useState(false);
  const [voiceVolume, setVoiceVolume] = useState(1);
  const [musicVolume, setMusicVolume] = useState(0.4);
  const musicRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('silent_mode');
    setSilentMode(saved === 'true');
  }, []);

  useEffect(() => {
    if (musicRef.current) {
      musicRef.current.volume = musicVolume;
    }
  }, [musicVolume]);

  async function generateSession() {
    const prompt = `Create a ${duration}-minute immersive ${mood.toLowerCase()} meditation in the style of ${voice}. Begin with breath guidance. Be peaceful, vivid, and emotionally resonant.`;
    const res = await fetchFromGemini({ prompt });
    if (res?.text) {
      if (musicRef.current) {
        musicRef.current.volume = Math.max(musicVolume * 0.3, 0.05);
        setTimeout(() => {
          if (musicRef.current) {
            musicRef.current.volume = musicVolume;
          }
        }, 12000);
      }
      setSession(res.text);
      setPlaying(true);
      if (!silentMode) speak(res.text, voice);
    }
  }

  return (
    <div
      className="relative min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${moodBackgrounds[mood]})` }}
    >
      <div className="absolute inset-0 bg-black/50 z-10" />
      <SparklesCore background="transparent" minSize={0.4} maxSize={1.6} className="absolute inset-0 z-20 pointer-events-none" particleDensity={40} particleColor="#88f5d3" />

      <div className="relative z-30 flex flex-col items-center justify-center px-6 py-24 text-center text-white">
        <h1 className="text-4xl font-bold mb-4 drop-shadow-xl">🧘‍♀️ Guided Meditation</h1>
        <p className="text-sm mb-6">Select your mood, voice, and duration. Your session will guide you inward.</p>

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
                  <option key={d}>{d} min</option>
                ))}
              </select>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col items-center space-y-4 mb-8">
          <label className="text-xs text-blue-200">🎙️ Voice Volume</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={voiceVolume}
            onChange={(e) => setVoiceVolume(parseFloat(e.target.value))}
            className="w-48"
          />

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
          className="bg-teal-500 hover:bg-teal-600 text-white font-semibold text-lg px-6 py-3 rounded-full shadow-xl"
        >
          {playing ? 'Restart Meditation' : 'Begin Meditation'}
        </Button>

        {session && (
          <div className="mt-10 max-w-2xl text-left bg-white/10 p-6 rounded-lg backdrop-blur-md shadow-lg text-sm leading-relaxed text-blue-100 whitespace-pre-wrap">
            {session}
          </div>
        )}
      </div>

      <audio
        ref={musicRef}
        src={`/audio/${mood.toLowerCase()}.mp3`}
        autoPlay
        loop
        className="hidden"
      />
    </div>
  );
}