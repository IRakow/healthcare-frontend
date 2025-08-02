import { useEffect, useState } from 'react';
import { Mic, Send } from 'lucide-react';
import { speak } from '@/lib/voice/RachelTTSQueue';
import { useRachelMemoryStore } from '@/lib/voice/useRachelMemoryStore';
import { handleThreadFollowup } from '@/lib/voice/handleThreadFollowup';

export function AssistantBar() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      // TODO: Implement AI response
      const response = "I'm Rachel, your AI assistant. This feature is being implemented.";
      speak(response);
      console.log('Rachel:', response);
    } catch (err) {
      console.error('Assistant error:', err);
    }
    setInput('');
    setLoading(false);
  };

  const handleVoice = () => {
    setListening(true);
    // TODO: Implement voice listening with Web Speech API
    // For now, just toggle the state
    setTimeout(() => setListening(false), 2000);
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

export default AssistantBar;