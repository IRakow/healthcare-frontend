import { useState } from 'react';

export default function MeditationPage() {
  const [topic, setTopic] = useState('anxiety-relief');
  const [duration, setDuration] = useState(10);
  const [audio, setAudio] = useState('');

  const generate = async () => {
    const res = await fetch('/api/meditation', {
      method: 'POST',
      body: JSON.stringify({ topic, duration })
    });
    const { audioBase64 } = await res.json();
    setAudio(`data:audio/mpeg;base64,${audioBase64}`);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">🧘‍♂️ AI-Powered Meditation</h2>
      <select value={topic} onChange={(e) => setTopic(e.target.value)} className="input mb-2">
        <option value="anxiety-relief">Anxiety Relief</option>
        <option value="focus">Focus</option>
        <option value="sleep">Sleep Preparation</option>
      </select>
      <input type="number" min={5} max={30} value={duration} onChange={(e) => setDuration(parseInt(e.target.value))} className="input mb-2" placeholder="Duration (minutes)" />
      <button onClick={generate} className="btn-primary">Generate Session</button>
      {audio && <audio controls src={audio} className="mt-4 w-full" />}
    </div>
  );
}