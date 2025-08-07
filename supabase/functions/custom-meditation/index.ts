import { serve } from 'https://deno.land/std/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openaiKey = Deno.env.get('OPENAI_API_KEY')!;
const geminiKey = Deno.env.get('GEMINI_API_KEY')!;
const elevenKey = Deno.env.get('ELEVENLABS_API_KEY')!;
const voiceMap: Record<string, string> = { 
  Bella: 'EXAVITQu4vr4xnSDxMaL',
  Adam: '21m00Tcm4TlvDq8ikWAM' 
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
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
      console.log('Using Gemini API with key:', geminiKey ? 'Key exists' : 'No key found');
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Gemini API error:', res.status, errorText);
        throw new Error(`Gemini API error: ${res.status} - ${errorText}`);
      }
      
      const json = await res.json();
      script = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      if (!script) {
        console.error('No script generated from Gemini:', json);
        throw new Error('Gemini did not generate a meditation script');
      }
    } else {
      console.log('Using OpenAI API');
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
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('OpenAI API error:', res.status, errorText);
        throw new Error(`OpenAI API error: ${res.status} - ${errorText}`);
      }
      
      const json = await res.json();
      script = json.choices?.[0]?.message?.content || '';
      
      if (!script) {
        console.error('No script generated from OpenAI:', json);
        throw new Error('OpenAI did not generate a meditation script');
      }
    }

    console.log('Generating audio with ElevenLabs for voice:', voice, voiceMap[voice]);
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

    if (!elevenRes.ok) {
      const errorText = await elevenRes.text();
      console.error('ElevenLabs API error:', elevenRes.status, errorText);
      throw new Error(`ElevenLabs API error: ${elevenRes.status} - ${errorText}`);
    }

    const audioBuffer = await elevenRes.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
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

    return new Response(
      JSON.stringify({ audio_url: url }), 
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('Error in custom-meditation function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to generate meditation',
        details: error.toString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});