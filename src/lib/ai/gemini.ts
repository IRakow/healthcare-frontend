// src/lib/ai/gemini.ts

import { createClient } from 'groq-sdk';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) throw new Error('Missing Gemini API Key');

const gemini = createClient({
  apiKey: GEMINI_API_KEY,
});

interface GeminiRequest {
  prompt: string;
  context?: string;
}

export async function fetchFromGemini({ prompt, context }: GeminiRequest) {
  const messages = [
    { role: 'system', content: context || 'You are a helpful medical assistant.' },
    { role: 'user', content: prompt },
  ];

  try {
    const result = await gemini.chat.completions.create({
      model: 'gemini-1.5-flash-latest',
      messages,
      max_tokens: 1200,
      temperature: 0.4,
    });

    const text = result?.choices?.[0]?.message?.content;
    return { text };
  } catch (error) {
    console.error('Gemini Error:', error);
    return { text: 'There was an issue reaching Gemini. Please try again later.' };
  }
}