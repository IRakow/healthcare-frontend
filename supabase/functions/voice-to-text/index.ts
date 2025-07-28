import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { audioBlob, mimeType = 'audio/webm' } = await req.json()

    if (!audioBlob) {
      throw new Error('No audio provided')
    }

    // Initialize Deepgram
    const deepgramApiKey = Deno.env.get('DEEPGRAM_API_KEY')
    if (!deepgramApiKey) {
      throw new Error('Deepgram API key not configured')
    }

    // Convert base64 to binary
    const audioData = Uint8Array.from(atob(audioBlob), c => c.charCodeAt(0))

    // Send to Deepgram for transcription
    const response = await fetch('https://api.deepgram.com/v1/listen', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${deepgramApiKey}`,
        'Content-Type': mimeType,
      },
      body: audioData
    })

    const result = await response.json()
    const transcript = result.results?.channels?.[0]?.alternatives?.[0]?.transcript || ''

    return new Response(
      JSON.stringify({ transcript }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})