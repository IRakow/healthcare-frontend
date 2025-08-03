export async function fetchFromOpenAI({ prompt, system }: { prompt: string; system: string }) {
  try {
    const response = await fetch('/api/ai/openai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, system })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return { text: data.content || data.message || data.text };
  } catch (error) {
    console.error('[OpenAI Error]', error);
    return null;
  }
}