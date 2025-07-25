import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function VoiceScreen() {
  const [recording, setRecording] = useState(false);
  const [result, setResult] = useState('');

  async function startTest() {
    setRecording(true);
    setResult('');
    const res = await fetch('/functions/v1/voice-health-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patient_id: 'demo-id', duration: 15 })
    });
    const json = await res.json();
    setRecording(false);
    setResult(json.summary || 'No response');
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-blue-700">🎤 Voice Screening</h1>
      <Card>
        <p className="text-sm text-gray-600 mb-4">
          Please speak continuously for 15 seconds. Our AI will listen for potential signs of shortness of breath, cough, emotional tone, or fatigue.
        </p>
        <Button onClick={startTest} disabled={recording}>
          {recording ? 'Analyzing...' : 'Start 15-Second Test'}
        </Button>
        {result && (
          <p className="mt-4 text-sm text-blue-700 whitespace-pre-wrap">🧠 {result}</p>
        )}
      </Card>
    </div>
  );
}