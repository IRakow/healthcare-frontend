import { serve } from 'https://deno.land/std/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js';

const openaiKey = Deno.env.get('OPENAI_API_KEY')!;
const geminiKey = Deno.env.get('GEMINI_API_KEY')!;
const elevenKey = Deno.env.get('ELEVENLABS_API_KEY')!;
const voiceMap = { Bella: 'bella', Adam: 'adam' };

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

serve(async (req) => {
  const { topic, voice, model, duration, includeMusic, userId } = await req.json();

  const prompt = `
Create a ${duration}-minute guided meditation on the topic: "${topic}".
Tone: soft, calm, grounded.
Format: Direct voice guidance for a meditation session.
Structure: Start with breath, body, mind awareness. End with peaceful close.
DO NOT write instructions — generate what the voice will say aloud.
`;

  let script = '';

  if (model === 'Gemini') {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });
    const json = await res.json();
    script = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
  } else {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
      })
    });
    const json = await res.json();
    script = json.choices?.[0]?.message?.content || '';
  }

  const elevenRes = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceMap[voice]}`, {
    method: 'POST',
    headers: {
      'xi-api-key': elevenKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text: script,
      model_id: 'eleven_monolingual_v1',
      voice_settings: { stability: 0.45, similarity_boost: 0.85 }
    })
  });

  const audioBuffer = await elevenRes.arrayBuffer();
  const base64 = Buffer.from(audioBuffer).toString('base64');
  const url = `data:audio/mpeg;base64,${base64}`;

  // Log AI interaction
  if (userId) {
    try {
      // Get user role
      const { data: user } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      await supabase.from('ai_logs').insert({
        user_id: userId,
        role: user?.role || 'patient',
        model: model,
        voice_used: voice,
        action: 'Generate Meditation',
        input: JSON.stringify({ topic, duration, includeMusic }),
        output: script,
        success: true
      });
    } catch (error) {
      console.error('Error logging AI interaction:', error);
    }
  }

  return new Response(JSON.stringify({ audio_url: url }));
});