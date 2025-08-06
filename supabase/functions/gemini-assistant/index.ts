// File: supabase/functions/gemini-assistant/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  const { query, temperature = 0.7 } = await req.json();
  const apiKey = Deno.env.get('GEMINI_API_KEY');

  const response = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey || ''
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: query }] }],
        generationConfig: {
          temperature,
          topK: 1,
          topP: 1,
          maxOutputTokens: 2048
        }
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    return new Response(JSON.stringify({ error: errorText }), { status: 500 });
  }

  const data = await response.json();
  return new Response(
    JSON.stringify({
      content: data?.candidates?.[0]?.content?.parts?.[0]?.text || '',
      model: 'gemini-pro'
    }),
    {
      headers: { 'Content-Type': 'application/json' }
    }
  );
});