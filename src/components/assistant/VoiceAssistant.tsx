import { useEffect, useRef, useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

export default function VoiceAssistant({ role }: { role: string }) {
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const recognitionRef = useRef<any>(null);

  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognitionRef.current = recognition;
    recognition.onresult = async (event) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      const res = await fetch('/api/voice', {
        method: 'POST',
        body: JSON.stringify({ prompt: text, role })
      });
      const { reply } = await res.json();
      setResponse(reply);
    };
    recognition.start();
  };

  return (
    <div className="p-4 bg-white shadow rounded">
      <h2 className="text-lg font-semibold mb-2">🎙️ Ask Anything</h2>
      <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={startRecording}>Start Voice Session</button>
      {transcript && <p className="mt-2 text-sm text-gray-500">You said: {transcript}</p>}
      {response && <p className="mt-2 text-green-700 font-medium">AI says: {response}</p>}
    </div>
  );
}