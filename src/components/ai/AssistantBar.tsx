import { useEffect, useState } from 'react';
import { Mic, Send } from 'lucide-react';
import { speakWithElevenLabs, startListening } from '@/lib/voiceUtils';
import { sendToGemini } from '@/lib/ai/geminiClient';

export default function AssistantBar() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const response = await sendToGemini(input);
      speakWithElevenLabs(response);
      console.log('Rachel:', response);
    } catch (err) {
      console.error('Assistant error:', err);
    }
    setInput('');
    setLoading(false);
  };

  const handleVoice = () => {
    setListening(true);
    startListening((transcript: string) => {
      setInput(transcript);
      setListening(false);
    });
  };

  useEffect(() => {
    // optional: auto-listen on load
    // handleVoice();
  }, []);

  return (
    <div className="w-full rounded-xl shadow-lg bg-white border border-gray-200 p-4 flex items-center gap-2">
      <input
        className="flex-grow outline-none text-sm text-gray-800 placeholder:text-gray-400"
        placeholder="Ask Rachel anything..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        disabled={loading}
      />
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="text-blue-600 hover:text-blue-800"
      >
        <Send size={20} />
      </button>
      <button
        onClick={handleVoice}
        className={`text-blue-500 hover:text-blue-700 ${listening ? 'animate-pulse' : ''}`}
      >
        <Mic size={20} />
      </button>
    </div>
  );
}