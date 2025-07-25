import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const elevenKey = Deno.env.get('ELEVENLABS_API_KEY')!;

// Voice ID mapping for easier selection
const VOICE_IDS = {
  rachel: '21m00Tcm4TlvDq8ikWAM',
  domi: 'AZnzlk1XvdvUeBnXmlld',
  bella: 'EXAVITQu4vr4xnSDxMaL',
  antoni: 'ErXwobaYiN019PkySvjV',
  elli: 'MF3mGyEYCl7XYWbV9V6O',
  josh: 'TxGEqnHWrfWFTfGW9XjX',
  arnold: 'VR6AewLTigWG4xSOukaG',
  adam: 'pNInz6obpgDQGcFmaJgB',
  sam: 'yoZ06aMxZJJ28mfd3POQ',
};

serve(async (req) => {
  const { text, voice = 'rachel', model = 'eleven_monolingual_v1', stream = false } = await req.json();

  // Get voice ID from name or use directly if it's already an ID
  const voiceId = VOICE_IDS[voice.toLowerCase()] || voice;

  // For streaming response
  if (stream) {
    const ttsRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': elevenKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: model,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.8,
            style: 0.0,
            use_speaker_boost: true,
          },
        }),
      }
    );

    // Stream the audio data
    return new Response(ttsRes.body, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Transfer-Encoding': 'chunked',
      },
    });
  } else {
    // Non-streaming response
    const ttsRes = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'xi-api-key': elevenKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: model,
          voice_settings: {
            stability: 0.4,
            similarity_boost: 0.9,
          },
        }),
      }
    );

    const buffer = await ttsRes.arrayBuffer();
    return new Response(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
      },
    });
  }
});