// File: src/lib/deepgram.ts
export async function getDeepgramTranscript(audioBlob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append('audio', audioBlob);

  const res = await fetch('https://api.deepgram.com/v1/listen', {
    method: 'POST',
    headers: {
      Authorization: `Token ${import.meta.env.VITE_DEEPGRAM_API_KEY}`,
    },
    body: formData,
  });

  const data = await res.json();
  return data.results.channels[0].alternatives[0].transcript || '';
}