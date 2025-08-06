import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { input, context } = req.body

  // Build the prompt with context
  const prompt = context 
    ? `You are Rachel, a helpful healthcare AI assistant. ${context}\n\nUser says: "${input}"\n\nRespond helpfully and concisely.`
    : `You are Rachel, a helpful healthcare AI assistant. User says: "${input}"\n\nRespond helpfully and concisely.`

  try {
    // Use the Gemini API with the server-side API key
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    })

    const json = await response.json()
    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || 'I apologize, I could not process that request.'

    // Parse for navigation or function commands
    let action = null
    let route = null
    let functionName = null
    
    if (text.toLowerCase().includes('navigate to') || text.toLowerCase().includes('go to')) {
      action = 'navigate'
      // Extract route from response if mentioned
      if (text.includes('/patient')) {
        const match = text.match(/\/patient[\/\w-]*/);
        route = match ? match[0] : null;
      }
    }

    res.status(200).json({ 
      text,
      action,
      route,
      function: functionName
    })
  } catch (error) {
    console.error('Rachel API Error:', error)
    res.status(500).json({ 
      text: 'I apologize, I am having trouble connecting right now. Please try again.',
      error: true 
    })
  }
}