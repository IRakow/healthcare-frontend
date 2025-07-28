// File: supabase/functions/deepgram-transcribe/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  try {
    const form = await req.formData();
    const audioFile = form.get('audio') as File;

    if (!audioFile) {
      return new Response(JSON.stringify({ error: 'Audio file not provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const apiKey = Deno.env.get('DEEPGRAM_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Missing Deepgram API key' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const buffer = await audioFile.arrayBuffer();

    const response = await fetch('https://api.deepgram.com/v1/listen', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Content-Type': 'audio/webm' // Adjust this MIME type if needed
      },
      body: buffer
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({ error: data }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      transcript: data.results?.channels?.[0]?.alternatives?.[0]?.transcript || '',
      raw: data
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message || 'Unexpected error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
