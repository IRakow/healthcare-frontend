export async function fetchFromGemini({ prompt, context }: { prompt: string; context: string }) {
  try {
    const response = await fetch('/api/ai/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, context })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    return { text: data.content || data.message || data.text };
  } catch (error) {
    console.error('[Gemini Error]', error);
    return null;
  }
}