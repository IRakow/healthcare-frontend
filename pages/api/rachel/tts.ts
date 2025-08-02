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
      // Return error response if no API key
      return res.status(500).json({ 
        error: 'ElevenLabs API key not configured',
        hasApiKey: false 
      })
    }

    // Call ElevenLabs API
    // Use Rachel voice ID - recommended: 21m00Tcm4TlvDq8ikWAM
    const voiceId = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM' // Rachel voice
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          }
        })
      }
    )

    if (!response.ok) {
      console.error('ElevenLabs API error:', response.status, await response.text())
      return res.status(500).json({ error: 'TTS generation failed' })
    }

    // Get the audio data
    const audioBuffer = await response.arrayBuffer()
    
    // Set proper headers for audio response
    res.setHeader('Content-Type', 'audio/mpeg')
    res.setHeader('Content-Length', audioBuffer.byteLength.toString())
    
    // Send the audio data
    res.send(Buffer.from(audioBuffer))

  } catch (error) {
    console.error('TTS error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}