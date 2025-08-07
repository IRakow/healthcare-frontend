// File: src/lib/elevenlabs.ts
export async function playTextToSpeech(text: string, voiceId = 'Rachel') {
  // Map voice names to ElevenLabs voice IDs
  const voiceIdMap: Record<string, string> = {
    'Rachel': 'EXAVITQu4vr4xnSDxMaL',
    'Bella': 'EXAVITQu4vr4xnSDxMaL',
    'Adam': '21m00Tcm4TlvDq8ikWAM',
    'Arabella': 'XB0fDUnXU5powFXDhCwa',
    'Ana-Rita': 'LcfcDJNUP1GQjkzn1xUU',
    'Amelia': 'XrExE9yKIg1WjnnlVkGX',
    'Archimedes': 'SOYHLrjzK2X1ezoPC6cr',
    'Michael': 'flq6f7yk4E4fJM5XTYuZ'
  };

  const actualVoiceId = voiceIdMap[voiceId] || voiceIdMap['Rachel'];

  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${actualVoiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': import.meta.env.VITE_ELEVENLABS_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        voice_settings: { 
          stability: 0.4,
          similarity_boost: 0.8,
          style: 0.6,
          use_speaker_boost: true
        }
      }),
    });

    if (!res.ok) {
      throw new Error('ElevenLabs API error');
    }

    const blob = await res.blob();
    const audioUrl = URL.createObjectURL(blob);
    const audio = new Audio(audioUrl);
    await audio.play();
  } catch (err) {
    console.error('Error with ElevenLabs:', err);
    // Fallback to browser TTS
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  }
}