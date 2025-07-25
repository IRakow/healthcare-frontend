import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const elevenKey = Deno.env.get('ELEVENLABS_API_KEY')!;
    const voiceId = 'Rachel'; // Your default assistant voice

    const { text } = await req.json();

    if (!text) {
      throw new Error('No text provided');
    }

    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': elevenKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: { 
          stability: 0.5, 
          similarity_boost: 0.9 
        },
      }),
    });

    if (!res.ok) {
      throw new Error(`ElevenLabs API error: ${res.statusText}`);
    }

    const buffer = await res.arrayBuffer();
    
    return new Response(buffer, {
      headers: { 
        ...corsHeaders,
        'Content-Type': 'audio/mpeg' 
      },
    });
  } catch (error) {
    console.error('Text-to-speech error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        },
        status: 500
      }
    );
  }
});