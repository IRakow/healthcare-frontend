/// <reference types="deno" />
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  let payload
  try {
    payload = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const {
    query,
    temperature = 0.7,
    systemPrompt = 'You are a helpful assistant.'
  } = payload

  if (!query) {
    return new Response(JSON.stringify({ error: 'Missing query input' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const apiKey = Deno.env.get('OPENAI_API_KEY')
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API key missing' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      temperature,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query }
      ]
    })
  })

  if (!openaiResponse.ok) {
    const errorText = await openaiResponse.text()
    return new Response(JSON.stringify({ error: errorText }), {
      status: openaiResponse.status,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  const data = await openaiResponse.json()

  return new Response(
    JSON.stringify({
      content: data.choices?.[0]?.message?.content || '',
      model: data.model,
      usage: data.usage
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  )
})
