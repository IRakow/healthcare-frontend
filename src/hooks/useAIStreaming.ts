// File: src/hooks/useAIStreaming.ts
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getDeepgramTranscript } from '@/lib/deepgram';
import { playTextToSpeech } from '@/lib/elevenlabs';
import { useUserRole } from '@/hooks/useUserRole';

export function useAIStreaming() {
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const role = useUserRole();

  const streamPrompt = async ({
    input,
    voice = false,
  }: {
    input: string;
    voice?: boolean;
  }) => {
    setIsLoading(true);
    setResponse('');

    try {
      // Use Supabase Edge Functions based on role
      const useGemini = role === 'patient' || role === 'provider';
      const endpoint = useGemini ? 'gemini-assistant' : 'ai-voice-navigator';
      
      const { data, error } = await supabase.functions.invoke(endpoint, {
        body: { 
          prompt: input,
          query: input 
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      const fullResponse = data?.text || data?.response || 'I understand your request.';
      
      // Simulate streaming by adding text progressively
      const words = fullResponse.split(' ');
      let currentText = '';
      
      for (const word of words) {
        currentText += (currentText ? ' ' : '') + word;
        setResponse(currentText);
        await new Promise(resolve => setTimeout(resolve, 30)); // Small delay for streaming effect
      }

      // Save conversation to Supabase
      await supabase.from('ai_conversations').insert({
        role,
        input,
        response: fullResponse,
      });

      if (voice) {
        await playTextToSpeech(fullResponse);
      }
    } catch (err) {
      console.error(err);
      setResponse('⚠️ Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  // Keep backward compatibility
  const streamAI = (input: string) => streamPrompt({ input, voice: true });

  return { response, isLoading, streamPrompt, streamAI };
}