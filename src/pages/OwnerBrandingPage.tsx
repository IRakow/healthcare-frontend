import { useState } from 'react';

export default function OwnerBrandingPage() {
  const [primary, setPrimary] = useState('#3490dc');
  const [voice, setVoice] = useState('Chill Phil');
  const [welcomeMsg, setWelcomeMsg] = useState('Welcome to Purity Health!');

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">🎨 Customize Your Brand</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded shadow p-4">
          <label className="text-sm font-medium">Primary Color</label>
          <input type="color" className="mt-2 w-full h-10" value={primary} onChange={e => setPrimary(e.target.value)} />
        </div>
        <div className="bg-white rounded shadow p-4">
          <label className="text-sm font-medium">Assistant Voice</label>
          <select className="w-full mt-2 p-2 border rounded" value={voice} onChange={e => setVoice(e.target.value)}>
            <option>Chill Phil</option>
            <option>Priyanka Sogam</option>
            <option>Jason Pro</option>
          </select>
        </div>
        <div className="bg-white rounded shadow p-4">
          <label className="text-sm font-medium">Welcome Message</label>
          <textarea rows={3} className="w-full p-2 border rounded mt-2 text-sm" value={welcomeMsg} onChange={e => setWelcomeMsg(e.target.value)} />
        </div>
      </div>
    </div>
  );
}