import { useState } from 'react';

export default function VoiceAssistantDemo() {
  const [transcript, setTranscript] = useState('');

  const handleRecord = () => {
    // Simulated voice capture (placeholder)
    setTranscript('Book an appointment tomorrow at 2 PM');
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4">🎙️ AI Voice Assistant</h2>
      <button onClick={handleRecord} className="btn-primary">Start Listening</button>
      {transcript && (
        <div className="mt-4">
          <p className="text-sm text-gray-600">Transcript:</p>
          <p className="bg-white p-3 rounded shadow">{transcript}</p>
        </div>
      )}
    </div>
  );
}