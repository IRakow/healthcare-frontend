// src/lib/ai/gemini.ts

import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

interface GeminiRequest {
  prompt: string;
  context?: string;
}

export async function fetchFromGemini({ prompt, context }: GeminiRequest) {
  if (!genAI) {
    console.warn('Gemini API key not configured');
    return { text: 'Gemini is not configured. Please add the API key.' };
  }
  
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const fullPrompt = context 
      ? `${context}\n\nUser: ${prompt}`
      : prompt;
    
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();
    
    return { text };
  } catch (error) {
    console.error('Gemini Error:', error);
    return { text: 'There was an issue reaching Gemini. Please try again later.' };
  }
}