import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { nlpParser } from '@/services/nlpParser';
import { handleSearchIntent } from '@/services/handleSearchIntent';
import { Mic, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SmartCommandBarProps {
  role?: 'patient' | 'provider' | 'admin' | 'owner';
}

export function SmartCommandBar({ role = 'patient' }: SmartCommandBarProps) {
  const [input, setInput] = useState('');
  const [reply, setReply] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit() {
    if (!input.trim() || isProcessing) return;

    setIsProcessing(true);
    try {
      // Parse the input
      const intent = nlpParser.parseUserInput(input, role);
      
      if (!intent) {
        setReply('❓ I could not understand that command.');
        return;
      }

      // Get user ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setReply('❌ Please log in first');
        return;
      }

      // Handle the intent
      const result = await handleSearchIntent(user.id, intent, navigate);
      setReply(result || '✅ Done');
      
      // Clear input on success
      if (result?.includes('Navigating') || result?.includes('✅')) {
        setTimeout(() => {
          setInput('');
          setReply('');
        }, 2000);
      }
    } catch (error) {
      console.error('Command error:', error);
      setReply('❌ Something went wrong');
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-[90%] sm:w-[600px] bg-white/95 backdrop-blur-sm border shadow-lg rounded-xl px-4 py-3 flex items-center gap-3 z-50">
      <input
        type="text"
        value={input}
        placeholder="Try: 'Show me labs' or 'Book with Dr. Smith tomorrow at 3'"
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={isProcessing}
      />
      <Button onClick={handleSubmit} disabled={!input.trim() || isProcessing}>
        {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Go'}
      </Button>
      {reply && (
        <p className={`text-sm ml-2 ${
          reply.includes('❓') || reply.includes('❌') ? 'text-red-500' : 
          reply.includes('🧭') ? 'text-blue-500' : 'text-green-500'
        }`}>
          {reply}
        </p>
      )}
    </div>
  );
}

// Example usage:
/*
import { SmartCommandBar } from '@/components/SmartCommandBar';

function App() {
  const user = useAuth();
  
  return (
    <div>
      <SmartCommandBar role={user?.user_metadata?.role || 'patient'} />
    </div>
  );
}
*/