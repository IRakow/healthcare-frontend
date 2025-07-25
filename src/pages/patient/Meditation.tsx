import { Card } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

export default function Meditation() {
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-blue-700">🧘 Guided Meditation</h1>
      <p className="text-gray-600 text-sm">Select a meditation type or start an ambient timer with AI voice intro.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/patient/meditation/start?type=grounding')}>
          <h3 className="text-lg font-semibold mb-2">🌿 5-Min Grounding</h3>
          <p className="text-sm text-gray-600">Quick breathwork and presence reset</p>
        </Card>
        <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/patient/meditation/start?type=calm')}>
          <h3 className="text-lg font-semibold mb-2">🌊 10-Min Calm Reset</h3>
          <p className="text-sm text-gray-600">AI-guided calm induction + ambient music</p>
        </Card>
        <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/patient/meditation/start?type=sleep')}>
          <h3 className="text-lg font-semibold mb-2">🛌 Sleep Prep</h3>
          <p className="text-sm text-gray-600">Wind down with progressive body scan</p>
        </Card>
        <Card className="p-4 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/patient/meditation/start?type=ambient')}>
          <h3 className="text-lg font-semibold mb-2">🎧 Ambient Mode</h3>
          <p className="text-sm text-gray-600">Soft music only — no voice</p>
        </Card>
      </div>
    </div>
  );
}