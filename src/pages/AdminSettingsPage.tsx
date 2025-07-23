import { useState } from 'react';

export default function AdminSettingsPage() {
  const [voice, setVoice] = useState('Chill Phil');

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">🎨 Admin Settings</h1>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Upload Platform Logo</h2>
          <input type="file" className="w-full border rounded p-2 text-sm" />
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Select Default ElevenLabs Voice</h2>
          <select
            className="w-full border p-2 rounded text-sm"
            value={voice}
            onChange={e => setVoice(e.target.value)}
          >
            <option>Chill Phil</option>
            <option>Priyanka Sogam</option>
            <option>Professional Jason</option>
          </select>
        </div>
      </div>
    </div>
  );
}