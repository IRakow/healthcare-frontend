import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RxSpinner } from '@/components/ui/spinner';
import { LayeredMeditationPlayer } from '@/components/meditation/LayeredMeditationPlayer';

function matchMusicToTopic(topic: string, voice: string) {
  if (topic.toLowerCase().includes('sleep')) return '/meditation-music/sleep-calmwave.mp3';
  if (topic.toLowerCase().includes('anxiety')) return '/meditation-music/anxiety-breath.mp3';
  return '/meditation-music/focus-harmony.mp3';
}

export default function CustomMeditation() {
  const [topic, setTopic] = useState('');
  const [voice, setVoice] = useState('Bella');
  const [model, setModel] = useState('Gemini');
  const [duration, setDuration] = useState(10);
  const [includeMusic, setIncludeMusic] = useState(true);
  const [audioUrl, setAudioUrl] = useState('');
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    
    const res = await fetch('/functions/v1/custom-meditation', {
      method: 'POST',
      body: JSON.stringify({ topic, voice, model, duration, includeMusic, userId: user?.id }),
      headers: { 'Content-Type': 'application/json' },
    });

    const { audio_url } = await res.json();
    setAudioUrl(audio_url);

    if (user) {
      await supabase.from('meditation_logs').insert({
        user_id: user.id,
        topic,
        voice,
        model,
        duration_minutes: duration,
        include_music: includeMusic,
        audio_url
      });
    }

    setLoading(false);
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-blue-700">🎧 Custom Meditation Generator</h1>

      <Card title="Build Your Session">
        <Input label="Meditation Topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. calm anxiety, focus, let go of stress" />

        <label className="block text-sm font-medium mt-4 mb-1">Voice</label>
        <select value={voice} onChange={(e) => setVoice(e.target.value)} className="w-full border p-2 rounded">
          <option value="Bella">Bella</option>
          <option value="Adam">Adam</option>
        </select>

        <label className="block text-sm font-medium mt-4 mb-1">AI Model</label>
        <select value={model} onChange={(e) => setModel(e.target.value)} className="w-full border p-2 rounded">
          <option value="Gemini">Gemini</option>
          <option value="ChatGPT">ChatGPT</option>
        </select>

        <label className="block text-sm font-medium mt-4 mb-1">Duration</label>
        <select value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full border p-2 rounded">
          {[5, 10, 15, 20].map((min) => <option key={min}>{min}</option>)}
        </select>

        <label className="flex items-center gap-2 mt-4 text-sm">
          <input type="checkbox" checked={includeMusic} onChange={(e) => setIncludeMusic(e.target.checked)} />
          Include background music
        </label>

        <Button className="mt-4" onClick={generate} disabled={loading}>Generate Session</Button>
      </Card>

      {loading && <RxSpinner />}
      {audioUrl && (
        <Card title="Your Session">
          {includeMusic ? (
            (() => {
              const musicSrc = matchMusicToTopic(topic, voice);
              return (
                <LayeredMeditationPlayer
                  voiceSrc={audioUrl}
                  musicSrc={musicSrc}
                />
              );
            })()
          ) : (
            <audio controls className="w-full mt-2" src={audioUrl} />
          )}
        </Card>
      )}
    </div>
  );
}