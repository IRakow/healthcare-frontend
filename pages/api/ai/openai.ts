import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { prompt } = req.body

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' })
    }

    // TODO: Add your OpenAI API key to environment variables
    const openaiApiKey = process.env.OPENAI_API_KEY

    if (!openaiApiKey) {
      console.warn('OPENAI_API_KEY is missing')
      // Return a mock response for testing
      return res.status(200).json({ 
        output: `I heard you say: "${prompt}". This is Rachel responding.` 
      })
    }

    // TODO: Implement actual OpenAI GPT-4 call
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are Rachel, a helpful medical AI assistant.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 150
      })
    })

    const data = await response.json()
    const output = data.choices?.[0]?.message?.content || 'I understand. How can I help you?'

    res.status(200).json({ output })

  } catch (error) {
    console.error('OpenAI API error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}