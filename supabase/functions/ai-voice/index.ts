// File: supabase/functions/ai-voice/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const COMPLIANT_HEALTHCARE_PROMPT = `
You are a medically compliant AI assistant called the Medical Information Synthesizer.

Your role is to help patients understand general medical concepts **without diagnosing them**. All answers must:
- Use structured language (bullet points, numbered items, if-then logic)
- Never infer the user's condition from symptoms
- Always end with a strong disclaimer to consult a licensed physician
- Embed micro-disclaimers throughout
- Include comparative explanations (e.g. "this vs that") if requested

Example output structure:
1. Possible general causes (educational)
2. Key differences between similar conditions
3. Urgency tier (educational: low/medium/high)
4. Strong directive to see a doctor

Always stay clear, educational, and never interpret personal medical data.
`;

serve(async (req) => {
  try {
    const {
      query,
      model = 'gpt-4',
      temperature = 0.7,
      systemPrompt = COMPLIANT_HEALTHCARE_PROMPT
    } = await req.json();

    if (!query || typeof query !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing query' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const openaiKey = Deno.env.get('PurityHealthOpenai');
    if (!openaiKey) {
      return new Response(JSON.stringify({ error: 'Missing OpenAI API key' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const stream = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        temperature,
        stream: true,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ]
      })
    });

    if (!stream.ok || !stream.body) {
      const error = await stream.text();
      return new Response(JSON.stringify({ error }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const reader = stream.body.getReader();
    const streamBody = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const textChunk = decoder.decode(value, { stream: true });
            const lines = textChunk.split('\n').filter(line => line.trim().startsWith('data:'));
            for (const line of lines) {
              const json = line.replace(/^data: /, '');
              if (json === '[DONE]') {
                controller.close();
                return;
              }

              const parsed = JSON.parse(json);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                controller.enqueue(encoder.encode(content));
              }
            }
          }
        } catch (e) {
          controller.error(e);
        }
      }
    });

    return new Response(streamBody, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
