// src/lib/ai/openai.ts

import OpenAI from 'openai';

const OPENAI_API_KEY = import.meta.env.VITE_PURITY_HEALTH_OPENAI || process.env.PURITY_HEALTH_OPENAI;

if (!OPENAI_API_KEY) throw new Error('Missing OpenAI API Key');

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Only if you're using in browser directly
});

interface OpenAIRequest {
  prompt: string;
  system?: string;
}

export async function fetchFromOpenAI({ prompt, system }: OpenAIRequest) {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: system || 'You are Rachel, a powerful admin assistant AI. Answer clearly and helpfully.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.5,
      max_tokens: 1200,
    });

    const text = completion?.choices?.[0]?.message?.content;
    return { text };
  } catch (error) {
    console.error('OpenAI Error:', error);
    return { text: 'There was an issue reaching OpenAI. Please try again later.' };
  }
}