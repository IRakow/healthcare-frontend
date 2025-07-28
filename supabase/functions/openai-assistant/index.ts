// File: supabase/functions/openai-assistant/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

serve(async (req) => {
  const { query, temperature = 0.7, systemPrompt = 'You are a helpful assistant.' } = await req.json();
  const apiKey = Deno.env.get('PurityHealthOpenai');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      temperature,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    return new Response(JSON.stringify({ error: errorText }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const data = await response.json();
  return new Response(JSON.stringify({
    content: data.choices?.[0]?.message?.content || '',
    model: data.model,
    usage: data.usage
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
});
