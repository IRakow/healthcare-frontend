// src/pages/patient/TelemedVisit.tsx

import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUser } from '@/hooks/useUser';
import { speak } from '@/lib/voice/RachelTTSQueue';

export default function TelemedVisit() {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [roomStarted, setRoomStarted] = useState(false);
  const [transcript, setTranscript] = useState('');
  const { user } = useUser();

  useEffect(() => {
    // Load WebRTC or pre-join signaling logic
    if (roomStarted) startVideo();
  }, [roomStarted]);

  async function startVideo() {
    // For now, this is simulated. Replace with real WebRTC config.
    if (localVideoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then((stream) => {
          localVideoRef.current\!.srcObject = stream;
          localVideoRef.current\!.play();
        });
    }
  }

  async function handleEndVisit() {
    const summaryPrompt = `Patient: ${user?.email}. Transcript: ${transcript}`;
    const response = await fetch('/api/ai/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: summaryPrompt, context: 'Summarize this patient-provider visit in SOAP format.' })
    }).then(res => res.json());

    const { error } = await supabase.from('visit_notes').insert({
      patient_id: user?.id,
      summary: response.text,
      raw_transcript: transcript
    });

    speak("Visit complete. Your summary has been saved.");
    setRoomStarted(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-6 pb-24">
      <h1 className="text-2xl font-bold text-center mb-6">Telemedicine Visit 🩺</h1>

      {\!roomStarted ? (
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Ready to connect with your provider?</p>
          <Button onClick={() => setRoomStarted(true)} className="text-white bg-blue-600 hover:bg-blue-700">
            Start Visit
          </Button>
        </div>
      ) : (
        <Card className="max-w-4xl mx-auto">
          <CardContent className="flex flex-col md:flex-row gap-6 p-6">
            <div className="flex-1 space-y-2">
              <h2 className="font-semibold text-lg">You</h2>
              <video ref={localVideoRef} muted className="rounded-xl w-full aspect-video bg-black" />
            </div>
            <div className="flex-1 space-y-2">
              <h2 className="font-semibold text-lg">Provider</h2>
              <video ref={remoteVideoRef} className="rounded-xl w-full aspect-video bg-gray-200" />
            </div>
          </CardContent>
        </Card>
      )}

      {roomStarted && (
        <div className="text-center mt-6">
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Live transcript from Deepgram will appear here..."
            className="w-full max-w-2xl mx-auto p-3 border border-gray-300 rounded-lg shadow-sm text-sm"
            rows={5}
          />
          <div className="mt-4">
            <Button onClick={handleEndVisit} variant="destructive">
              End Visit & Save Summary
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
ENDOFFILE < /dev/null