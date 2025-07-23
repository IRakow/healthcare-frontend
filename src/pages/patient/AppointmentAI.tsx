import { useState } from 'react';

export default function AppointmentAI() {
  const [request, setRequest] = useState('');
  const [suggestion, setSuggestion] = useState('');

  const handleAI = async () => {
    const res = await fetch('/api/appointments/ai-book', {
      method: 'POST',
      body: JSON.stringify({ prompt: request })
    });
    const { result } = await res.json();
    setSuggestion(result);
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">📅 AI Appointment Scheduler</h2>
      <textarea value={request} onChange={(e) => setRequest(e.target.value)} className="input mb-2" placeholder="E.g. I want to see a doctor Friday afternoon about back pain" />
      <button onClick={handleAI} className="btn-primary">Find Availability</button>
      {suggestion && <div className="mt-4 text-green-600">✅ Suggested Slot: {suggestion}</div>}
    </div>
  );
}