export async function createAIChat(prompt: string) {
  const res = await fetch('/api/ai/summarize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  })

  if (!res.ok) throw new Error('Failed to generate summary')
  const { summary } = await res.json()
  return summary
}