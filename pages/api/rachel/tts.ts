import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { text } = req.body

    if (!text) {
      return res.status(400).json({ error: 'Text is required' })
    }

    // Check for ElevenLabs API key
    const apiKey = process.env.ELEVENLABS_API_KEY
    
    if (!apiKey) {
      console.warn('ELEVENLABS_API_KEY is missing in this environment')
    }

    // TODO: Integrate with ElevenLabs API
    // For now, return a success response
    res.status(200).json({ 
      success: true, 
      message: 'TTS request received',
      text: text,
      hasApiKey: !!apiKey
    })

  } catch (error) {
    console.error('TTS error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}