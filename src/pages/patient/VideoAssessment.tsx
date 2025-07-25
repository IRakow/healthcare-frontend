import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function VideoAssessment() {
  const [submitting, setSubmitting] = useState(false);
  const [summary, setSummary] = useState('');

  async function submitVideo() {
    setSubmitting(true);
    const res = await fetch('/functions/v1/video-health-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patient_id: 'demo-id', file_url: '/videos/patient-intro-demo.mp4' })
    });
    const json = await res.json();
    setSummary(json.summary || 'No data returned');
    setSubmitting(false);
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-blue-700">🎥 Video Assessment</h1>
      <Card>
        <p className="text-sm text-gray-600 mb-4">
          Record a short 5–10 second video where you say hello and introduce yourself casually. Our AI will scan for posture, breathing rate, facial stress cues, and energy level.
        </p>
        <Button onClick={submitVideo} disabled={submitting}>
          {submitting ? 'Analyzing Video...' : 'Upload Video & Analyze'}
        </Button>
        {summary && (
          <p className="mt-4 text-sm text-blue-700 whitespace-pre-wrap">🧠 {summary}</p>
        )}
      </Card>
    </div>
  );
}