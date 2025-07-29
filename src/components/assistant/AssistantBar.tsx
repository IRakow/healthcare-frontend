// File: src/components/assistant/AssistantBar.tsx

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useUser } from '@/hooks/useUser';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function AssistantBar() {
  const { user } = useUser();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');

  const handleAsk = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResponse('');
    try {
      const { data, error } = await supabase.functions.invoke('ai-command-processor', {
        body: { user_id: user?.id, input },
      });
      if (error) throw error;
      setResponse(data.result || 'No response.');
    } catch (err) {
      toast.error('AI assistant failed.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full p-4 bg-white/70 backdrop-blur rounded-xl shadow-md space-y-2">
      <div className="flex items-center gap-3">
        <Input
          placeholder="Ask your assistant..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Button onClick={handleAsk} disabled={loading} className="bg-sky-600 text-white">
          {loading ? 'Thinking...' : 'Ask'}
        </Button>
      </div>
      {response && <p className="text-sm text-gray-700 whitespace-pre-wrap">{response}</p>}
    </div>
  );
}