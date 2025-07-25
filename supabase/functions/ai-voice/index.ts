import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const openaiKey = Deno.env.get('PurityHealthOpenai')!;
const encoder = new TextEncoder();

serve(async (req) => {
  const { query } = await req.json();

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openaiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [{ role: 'user', content: query }],
      temperature: 0.7,
      stream: true,
    }),
  });

  const reader = response.body!.getReader();
  const decoder = new TextDecoder();

  const stream = new ReadableStream({
    async start(controller) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter((l) => l.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const json = line.replace('data: ', '');
            if (json === '[DONE]') {
              controller.close();
              return;
            }
            const parsed = JSON.parse(json);
            const text = parsed.choices?.[0]?.delta?.content;
            if (text) controller.enqueue(encoder.encode(text));
          }
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
    },
  });
});