// File: src/hooks/useAIStreaming.ts

import { useState } from 'react';

export function useAIStreaming() {
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const streamAI = async (input: string) => {
    setLoading(true);
    setError(null);
    setResponse('');

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input })
      });

      if (!res.ok) throw new Error('AI request failed');

      const reader = res.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      let fullText = '';

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        fullText += chunk;
        setResponse(prev => prev + chunk);
      }
    } catch (err: any) {
      setError(err.message || 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  return { response, streamAI, loading, error };
}