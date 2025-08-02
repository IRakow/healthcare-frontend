// ✅ /pages/api/deepgram/stream.ts

import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  try {
    // Placeholder: Forward audio stream or initialize socket here
    res.status(200).json({ message: 'Deepgram stream placeholder OK' })
  } catch (err) {
    console.error('[Deepgram Stream Error]', err)
    res.status(500).json({ error: 'Internal Server Error' })
  }
}