export async function runAI({
  prompt,
  model = 'openai'
}: {
  prompt: string;
  model?: 'openai' | 'gemini';
}) {
  const endpoint = model === 'gemini' ? '/api/ai/gemini' : '/api/ai/openai'

  const res = await fetch(endpoint, {
    method: 'POST',
    body: JSON.stringify({ prompt }),
    headers: { 'Content-Type': 'application/json' }
  })

  const { output } = await res.json()
  return output
}