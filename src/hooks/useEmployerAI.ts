import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Employer } from '@/types/employer';

export function useEmployerAI(employerId: string) {
  const [config, setConfig] = useState<Partial<Employer> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConfig();
  }, [employerId]);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('employers')
        .select('assistant_model, assistant_temp, assistant_tone, assistant_voice, name')
        .eq('id', employerId)
        .single();

      if (error) throw error;
      setConfig(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  const queryAI = async (query: string) => {
    if (!config) throw new Error('Configuration not loaded');

    const { assistant_model, assistant_temp } = config;
    const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: assistant_model || 'gpt-4',
        temperature: assistant_temp ?? 0.7,
        messages: [{ role: 'user', content: query }],
      }),
    });

    if (!res.ok) throw new Error('AI query failed');
    
    const data = await res.json();
    return data.choices[0].message.content;
  };

  return {
    config,
    loading,
    error,
    queryAI,
    reload: loadConfig
  };
}