import { fetchFromOpenAI } from './openai';
import { fetchFromGemini } from './gemini';

export async function callOpenAI(prompt: string) {
  return await fetchFromOpenAI({
    prompt,
    system: 'You are Rachel, a powerful admin assistant. Respond clearly, helpfully, and with full system intelligence.'
  });
}

export async function callGemini(prompt: string) {
  return await fetchFromGemini({
    prompt,
    context: 'This is for a HIPAA-compliant health admin system. Only return educational or compliant operational advice.'
  });
}