// src/lib/ai/gemini.ts

interface GeminiRequest {
  prompt: string;
  context?: string;
}

export async function fetchFromGemini({ prompt, context }: GeminiRequest) {
  try {
    const fullPrompt = context 
      ? `${context}\n\nUser: ${prompt}`
      : prompt;

    // Call the API endpoint instead of using the SDK directly
    const response = await fetch('/api/ai/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: fullPrompt }),
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }

    const data = await response.json();
    return { text: data.output || 'No response from Gemini' };
  } catch (error) {
    console.error('Gemini Error:', error);
    return { text: 'There was an issue reaching Gemini. Please try again later.' };
  }
}