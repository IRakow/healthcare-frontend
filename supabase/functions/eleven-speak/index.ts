// File: supabase/functions/eleven-speak/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const { text, query, voice = '21m00Tcm4TlvDq8ikWAM', model_id = 'eleven_monolingual_v1' } = await req.json();
  const textToSpeak = text || query;

  const apiKey = Deno.env.get('ELEVENLABS_API_KEY');
  if (!apiKey || !textToSpeak) {
    return new Response(JSON.stringify({ error: 'Missing API key or text input' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'audio/mpeg'
    },
    body: JSON.stringify({
      text: textToSpeak,
      model_id,
      voice_settings: {
        stability: 0.4,
        similarity_boost: 0.8,
        style: 0.6,
        use_speaker_boost: true
      }
    })
  });

  if (!response.ok) {
    const error = await response.text();
    return new Response(JSON.stringify({ error }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const audio = await response.arrayBuffer();
  
  // Convert to base64 data URL for easy playback
  const uint8Array = new Uint8Array(audio);
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    const chunk = uint8Array.slice(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  const base64 = btoa(binary);
  const audioUrl = `data:audio/mpeg;base64,${base64}`;
  
  return new Response(JSON.stringify({ audio_url: audioUrl }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    }
  });
});
