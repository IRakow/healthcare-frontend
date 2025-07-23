import { useState, useRef } from 'react';
import { Play } from 'lucide-react';

interface Props {
  context: string;
}

export default function DeepgramAssistant({ context }: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    audioChunks.current = [];

    mediaRecorder.ondataavailable = (event) => {
      audioChunks.current.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

      setLoading(true);
      const { data: transcription } = await fetch('/functions/v1/speech-to-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audio: base64Audio })
      }).then(r => r.json());

      setTranscript(transcription?.text || '');

      const { data: aiReply } = await fetch('/functions/v1/openai-health-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: transcription?.text,
          voiceMode: true,
          context
        })
      }).then(r => r.json());

      setResponse(aiReply?.analysis || '');

      await fetch('/functions/v1/elevenlabs-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: aiReply?.analysis })
      })
        .then(res => res.blob())
        .then(blob => new Audio(URL.createObjectURL(blob)).play());

      setLoading(false);
    };

    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  return (
    <div className="flex gap-3 items-center">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`rounded-full p-3 ${isRecording ? 'bg-red-500' : 'bg-green-600'} text-white hover:scale-105 transition`}
      >
        <Play className="w-5 h-5" />
      </button>
      {loading ? (
        <p className="text-sm text-gray-600">Processing...</p>
      ) : transcript && response ? (
        <div className="text-sm text-gray-700">
          <strong>You:</strong> {transcript}<br />
          <strong>AI:</strong> {response}
        </div>
      ) : (
        <p className="text-sm text-gray-400">Ask something aloud</p>
      )}
    </div>
  );
}