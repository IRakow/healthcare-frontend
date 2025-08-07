// File: supabase/functions/generate-meditation-audio/index.ts

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

  try {
    const { topic, voice = 'Bella', includeMusic = true, model = 'gemini', duration = 10 } = await req.json();

    // Voice ID mapping
    const voiceIdMap: Record<string, string> = {
      'Bella': 'EXAVITQu4vr4xnSDxMaL',
      'Rachel': 'EXAVITQu4vr4xnSDxMaL',
      'Adam': '21m00Tcm4TlvDq8ikWAM',
      'Arabella': 'XB0fDUnXU5powFXDhCwa',
      'Ana-Rita': 'LcfcDJNUP1GQjkzn1xUU',
      'Amelia': 'XrExE9yKIg1WjnnlVkGX',
      'Archimedes': 'SOYHLrjzK2X1ezoPC6cr',
      'Michael': 'flq6f7yk4E4fJM5XTYuZ'
    };

    const voiceId = voiceIdMap[voice] || voiceIdMap['Bella'];

    // Generate meditation script using Gemini or OpenAI
    const prompt = `Generate a calming ${duration}-minute guided meditation on the topic "${topic}". 
    Use a gentle and immersive tone. Be peaceful, vivid, and emotionally resonant. 
    Do not include any stage directions like [pause] or [breathe] or asterisks.
    Begin with breath guidance and create a flowing, natural meditation experience.`;

    let meditationText = '';

    if (model === 'gemini') {
      const geminiKey = Deno.env.get('GEMINI_API_KEY');
      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: prompt }]
            }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 2048,
            }
          })
        }
      );

      const geminiData = await geminiResponse.json();
      meditationText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } else {
      // Use OpenAI
      const openaiKey = Deno.env.get('OPENAI_API_KEY');
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 2048,
        })
      });

      const openaiData = await openaiResponse.json();
      meditationText = openaiData.choices?.[0]?.message?.content || '';
    }

    // Clean the text (remove any formatting artifacts)
    const cleanedText = meditationText
      .replace(/\[.*?\]/g, '') // Remove any bracketed instructions
      .replace(/\*.*?\*/g, '') // Remove any asterisk formatting
      .replace(/#{1,6}\s?/g, '') // Remove markdown headers
      .trim();

    // Generate audio with ElevenLabs
    const elevenLabsKey = Deno.env.get('ELEVENLABS_API_KEY');
    const audioResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': elevenLabsKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg'
        },
        body: JSON.stringify({
          text: cleanedText,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.4,
            similarity_boost: 0.8,
            style: 0.6,
            use_speaker_boost: true
          }
        })
      }
    );

    if (!audioResponse.ok) {
      throw new Error('Failed to generate audio');
    }

    const audioBuffer = await audioResponse.arrayBuffer();
    
    // Convert to base64 for easy frontend consumption
    const uint8Array = new Uint8Array(audioBuffer);
    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.slice(i, i + chunkSize);
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    const base64Audio = btoa(binary);

    // Return meditation data
    return new Response(
      JSON.stringify({
        text: cleanedText,
        audio_url: `data:audio/mpeg;base64,${base64Audio}`,
        voice: voice,
        duration: duration,
        topic: topic,
        includeMusic: includeMusic // Note: Music mixing would need to be done client-side
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error: any) {
    console.error('Error generating meditation audio:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to generate meditation audio' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});