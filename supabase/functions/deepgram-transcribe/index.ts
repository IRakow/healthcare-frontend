import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const deepgramKey = Deno.env.get('BDInsperityHealthDeepGram')!;

serve(async (req) => {
  const audioBuffer = await req.arrayBuffer();

  const res = await fetch('https://api.deepgram.com/v1/listen', {
    method: 'POST',
    headers: {
      Authorization: `Token ${deepgramKey}`,
      'Content-Type': 'audio/wav',
    },
    body: audioBuffer,
  });

  const json = await res.json();
  return new Response(JSON.stringify(json), {
    headers: { 'Content-Type': 'application/json' },
  });
});