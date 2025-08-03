import { useState } from 'react';
import { Mic, Send } from 'lucide-react';
import { speak } from '@/lib/voice/RachelTTSQueue';
import { useVoiceCapture } from '@/lib/voice/useVoiceCapture';
import { handleAdminCommand } from '@/lib/voice/handleAdminCommand';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/hooks/useUser';

export function AssistantBar() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { userId } = useUser();

  const { startListening, stopListening, interimText, error } = useVoiceCapture({
    onFinalTranscript: async (transcript) => {
      setInput(transcript);
      await handleSubmit(transcript, true);
    },
    onInterim: (text) => {
      setInput(text);
    }
  });

  const handleSubmit = async (text?: string, viaVoice: boolean = false) => {
    const query = text || input;
    if (!query.trim()) return;

    setLoading(true);
    let result = '';

    try {
      result = await handleAdminCommand(query);
    } catch (err) {
      console.error('Assistant error:', err);
      result = 'Sorry, I encountered an error.';
      speak(result);
    }

    await supabase.from('admin_ai_logs').insert({
      admin_id: userId || 'unknown',
      timestamp: new Date().toISOString(),
      query_text: query,
      response_text: result,
      via_voice: viaVoice,
      status: result.includes('error') ? 'error' : 'success'
    });

    setInput('');
    setLoading(false);
  };

  return (
    <div className="w-full rounded-xl shadow-lg bg-white border border-gray-200 p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <input
          className="flex-grow outline-none text-sm text-gray-800 placeholder:text-gray-400"
          placeholder="Ask Rachel anything..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          disabled={loading}
        />
        <button
          onClick={() => handleSubmit()}
          disabled={loading}
          className="text-blue-600 hover:text-blue-800"
        >
          <Send size={20} />
        </button>
        <button
          onClick={startListening}
          className={`text-blue-500 hover:text-blue-700 ${interimText ? 'animate-pulse' : ''}`}
        >
          <Mic size={20} />
        </button>
      </div>
      {error && (
        <div className="text-xs text-red-500">{error}</div>
      )}
    </div>
  );
}

export default AssistantBar;