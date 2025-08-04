// src/components/assistant/AssistantBar.tsx

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { MicIcon, SendIcon } from 'lucide-react';
import { speak } from '@/lib/voice/RachelTTSQueue';

const globalCommandMap: Record<string, (payload?: any) => void> = {
  addHydrationGoal: (payload) => {
    console.log('Hydration goal set to:', payload?.target);
    // e.g. update goal state or Supabase mutation
  },
  toggleSilentMode: () => {
    const next = !(localStorage.getItem('silent_mode') === 'true');
    localStorage.setItem('silent_mode', JSON.stringify(next));
    window.location.reload();
  },
  openUploadModal: () => {
    const e = new CustomEvent('open-upload-modal');
    window.dispatchEvent(e);
  },
  showVitals: () => {
    window.location.href = '/patient/vitals';
  }
};

export default function AssistantBar() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'rachel'; text: string }[]>([])
  const [silentMode, setSilentMode] = useState(false);
  const [recording, setRecording] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem('silent_mode');
    const last = localStorage.getItem('rachel_last_command');
    const micReady = localStorage.getItem('microphone_ready') === 'true';
    if (last) setInput(last);
    if (micReady) setTimeout(() => handleVoice(), 3000);
    setSilentMode(stored === 'true');
  }, []);

  useEffect(() => {
    const idleTimer = setTimeout(() => {
      if (!input && !recording && !response) {
        setInput("Hi, how can I help you today?");
      }
    }, 12000);
    return () => clearTimeout(idleTimer);
  }, [input, recording, response]);

  async function handleSubmit() {
    if (!input) return;
    setMessages(prev => [...prev, { role: 'user', text: input }]);
    const contextPrompt = `User is on ${window.location.pathname}. Last command: ${input}. Silent mode: ${silentMode}.`;
    const res = await fetch('/api/ai/rachel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input, context: contextPrompt })
    });
    const data = await res.json();
    setMessages(prev => [...prev, { role: 'rachel', text: data?.text }]);
    setResponse(data?.text);
    localStorage.setItem('rachel_last_command', input);
    if (!silentMode) speak(data?.text || '');
    if (data?.action === 'navigate' && data.route?.startsWith('/patient')) {
      router.push(data.route);
    } else if (data?.action === 'runFunction' && data.function) {
      globalCommandMap[data.function]?.(data.payload);
    }
  }

  async function handleVoice() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', audioBlob);

        const res = await fetch('/api/voice/deepgram-to-rachel', {
          method: 'POST',
          body: formData
        });

        const result = await res.json();
        if (result?.text) {
          setInput(result.text);
          setResponse(result.response);
          if (!silentMode) speak(result.response);
          if (result.action === 'navigate' && result.route?.startsWith('/patient')) {
            router.push(result.route);
          } else if (result.action === 'runFunction' && result.function) {
            globalCommandMap[result.function]?.(result.payload);
          }
        }
      };

      recorder.start();
      setRecording(true);
      setTimeout(() => {
        recorder.stop();
        stream.getTracks().forEach((t) => t.stop());
        setRecording(false);
        localStorage.setItem('microphone_ready', 'true');
      }, 5000);
    } catch (err) {
      console.error('Voice error', err);
      alert('Voice input failed. Please try again.');
    }
  }

  return (
    <div className="fixed bottom-0 left-0 w-full z-50 bg-white/90 border-t border-gray-200 shadow backdrop-blur-lg">
      <div className="max-w-2xl mx-auto flex items-center gap-2 p-3">
        <input
          ref={inputRef}
          type="text"
          placeholder="Ask Rachel anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          className="flex-1 px-4 py-2 rounded-full border border-gray-300 text-sm focus:outline-none focus:ring focus:border-blue-300"
        />
        <button
          onClick={handleSubmit}
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow transition"
        >
          <SendIcon className="w-4 h-4" />
        </button>
        <button
          onClick={handleVoice}
          className={`bg-sky-500 hover:bg-sky-600 text-white p-2 rounded-full shadow ${recording ? 'animate-pulse ring-2 ring-sky-300' : ''}`}
        >
          <MicIcon className="w-4 h-4" />
        </button>
      </div>
      {messages.length > 0 && (
        <div className="bg-white/90 border-t border-gray-200 px-4 py-2 text-xs max-h-40 overflow-y-auto">
          {messages.map((m, i) => (
            <div key={i} className={`mb-1 ${m.role === 'user' ? 'text-gray-900 font-medium' : 'text-blue-700 italic'}`}>
              {m.role === 'user' ? '🧍 ' : '🧠 '} {m.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}