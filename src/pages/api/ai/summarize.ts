import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { prompt } = req.body

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a clinical assistant summarizing patient intake forms into a helpful plain-English paragraph.' },
        { role: 'user', content: prompt }
      ]
    })
  })

  const json = await response.json()
  const summary = json?.choices?.[0]?.message?.content

  res.status(200).json({ summary })
}