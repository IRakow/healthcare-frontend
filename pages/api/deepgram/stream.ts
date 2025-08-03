import type { NextApiRequest, NextApiResponse } from 'next'
import WebSocket from 'ws'

// Store active WebSocket connections
const connections = new Map<string, WebSocket>()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const apiKey = process.env.DEEPGRAM_API_KEY || process.env.VITE_DEEPGRAM_API_KEY
  
  if (!apiKey) {
    console.error('[Deepgram] API key is missing')
    return res.status(500).json({ error: 'Deepgram API key not configured' })
  }

  // Handle GET requests for SSE streaming
  if (req.method === 'GET') {
    // Set up Server-Sent Events
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('Access-Control-Allow-Origin', '*')

    // Generate a unique connection ID
    const connectionId = Math.random().toString(36).substring(7)
    
    // Connect to Deepgram WebSocket
    const deepgramUrl = `wss://api.deepgram.com/v1/listen?encoding=linear16&sample_rate=16000&language=en-US&model=nova-2&punctuate=true&interim_results=true`
    
    const ws = new WebSocket(deepgramUrl, {
      headers: {
        'Authorization': `Token ${apiKey}`
      }
    })

    // Store the connection
    connections.set(connectionId, ws)

    // Send connection ID to client
    res.write(`data: ${JSON.stringify({ connectionId })}

`)

    ws.on('open', () => {
      console.log('[Deepgram] WebSocket connected')
    })

    ws.on('message', (data: Buffer) => {
      try {
        const response = JSON.parse(data.toString())
        
        if (response.channel?.alternatives?.[0]) {
          const transcript = response.channel.alternatives[0].transcript
          const isFinal = response.is_final
          
          if (transcript) {
            // Send transcript to client
            res.write(`data: ${JSON.stringify({
              transcript,
              is_final: isFinal
            })}

`)
          }
        }
      } catch (error) {
        console.error('[Deepgram] Parse error:', error)
      }
    })

    ws.on('error', (error: any) => {
      console.error('[Deepgram] WebSocket error:', error)
      res.write(`data: ${JSON.stringify({ error: 'Deepgram connection error' })}

`)
    })

    ws.on('close', () => {
      console.log('[Deepgram] WebSocket closed')
      connections.delete(connectionId)
      res.end()
    })

    // Handle client disconnect
    req.on('close', () => {
      console.log('[Deepgram] Client disconnected')
      ws.close()
      connections.delete(connectionId)
    })

  } else if (req.method === 'POST') {
    // Handle audio chunk uploads
    const connectionId = req.headers['x-connection-id'] as string
    
    if (!connectionId || !connections.has(connectionId)) {
      return res.status(400).json({ error: 'Invalid connection ID' })
    }

    const ws = connections.get(connectionId)!
    
    if (ws.readyState !== WebSocket.OPEN) {
      return res.status(400).json({ error: 'WebSocket not ready' })
    }

    // Collect the audio data
    const chunks: Buffer[] = []
    
    req.on('data', (chunk: Buffer) => {
      chunks.push(chunk)
    })

    req.on('end', () => {
      const audioData = Buffer.concat(chunks)
      
      // Convert audio if needed and send to Deepgram
      ws.send(audioData)
      
      res.status(200).json({ success: true })
    })

    req.on('error', (error) => {
      console.error('[Deepgram] Request error:', error)
      res.status(500).json({ error: 'Request processing error' })
    })

  } else {
    res.status(405).json({ error: 'Method Not Allowed' })
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}