// src/lib/ai/gemini.ts
import { supabase } from '@/lib/supabase';

interface GeminiRequest {
  prompt: string;
  context?: string;
}

export async function fetchFromGemini({ prompt, context }: GeminiRequest) {
  try {
    const fullPrompt = context 
      ? `${context}\n\nUser: ${prompt}`
      : prompt;

    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('gemini-assistant', {
      body: { prompt: fullPrompt }
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(error.message);
    }

    if (data?.error) {
      console.error('Gemini API error:', data.error);
      throw new Error(data.error);
    }

    const responseText = data?.response || data?.text || data?.output || 'No response from Gemini';
    return { text: responseText };
  } catch (error) {
    console.error('Gemini Error:', error);
    return { text: 'There was an issue reaching Gemini. Please try again later.' };
  }
}