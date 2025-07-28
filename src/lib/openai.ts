// File: src/lib/openai.ts

export async function callOpenAI(prompt: string, model = 'gpt-4o') {
    const secret = await fetch('/api/get-secret', {
      method: 'POST',
      body: JSON.stringify({ key: 'PurityHealthOpenai' }),
      headers: { 'Content-Type': 'application/json' }
    });
  
    const { value: apiKey } = await secret.json();
  
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
      })
    });
  
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || 'OpenAI request failed');
    return data.choices?.[0]?.message?.content;
  }
  