import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { handleSearchIntent } from '@/ai/actions/handleSearchIntent';
import { Mic, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function GeminiCommandBar() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  // Text-to-speech function
  function speak(text: string) {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      speechSynthesis.speak(utterance);
    }
  }

  async function handleSubmit() {
    if (!query.trim() || isProcessing) return;

    setIsProcessing(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        const message = '❌ Please log in first';
        setResponse(message);
        speak(message);
        return;
      }

      // Send to Gemini for intent parsing
      const geminiRes = await fetch('/functions/v1/gemini-intent', {
        method: 'POST',
        body: JSON.stringify({ input: query }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (!geminiRes.ok) {
        throw new Error('Failed to parse intent');
      }

      const parsed = await geminiRes.json();
      
      // Handle the parsed intent
      const reply = await handleSearchIntent(user.id, parsed, navigate);
      setResponse(reply);
      speak(reply);

      // Log the AI interaction
      try {
        await supabase.from('ai_logs').insert({
          user_id: user.id,
          input: query,
          output: reply,
          command: parsed?.command || 'unknown'
        });
      } catch (logError) {
        console.error('Failed to log AI interaction:', logError);
      }

      // Clear on success
      if (reply.includes('✅') || reply.includes('🧭')) {
        setTimeout(() => {
          setQuery('');
          setResponse('');
        }, 3000);
      }
    } catch (error) {
      console.error('Command error:', error);
      const message = '❌ Something went wrong. Please try again.';
      setResponse(message);
      speak(message);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-[90%] max-w-2xl bg-white/95 backdrop-blur-sm border shadow-lg rounded-xl p-4 z-50">
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={query}
          placeholder="Ask me anything... 'Show me labs' or 'Book appointment with Dr. Smith'"
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          className="flex-1 border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isProcessing}
        />
        <Button 
          onClick={handleSubmit} 
          disabled={!query.trim() || isProcessing}
          className="min-w-[80px]"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing
            </>
          ) : (
            'Send'
          )}
        </Button>
      </div>
      
      {response && (
        <div className={`mt-3 p-3 rounded-lg text-sm ${
          response.includes('❌') ? 'bg-red-50 text-red-700' :
          response.includes('🧭') ? 'bg-blue-50 text-blue-700' :
          response.includes('✅') ? 'bg-green-50 text-green-700' :
          'bg-gray-50 text-gray-700'
        }`}>
          {response}
        </div>
      )}
    </div>
  );
}

// Example usage:
/*
import { GeminiCommandBar } from '@/components/GeminiCommandBar';

function App() {
  return (
    <div>
      <GeminiCommandBar />
    </div>
  );
}
*/