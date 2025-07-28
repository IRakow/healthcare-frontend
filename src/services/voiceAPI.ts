// File: src/services/voiceAPI.ts

const SUPABASE_FN_URL = import.meta.env.VITE_SUPABASE_FN_BASE || 'https://dhycdcugbjchktvqlroz.functions.supabase.co';

export const voiceAPI = {
  // 1. Send query to AI (OpenAI, Gemini, Claude depending on employer config)
  async queryAI(query: string): Promise<Response> {
    const response = await fetch(`${SUPABASE_FN_URL}/ai-voice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`AI Voice query failed: ${response.statusText}`);
    }

    return response;
  },

  // 2. Stream response chunks for real-time assistant bar
  async streamAIResponse(
    query: string,
    onChunk: (chunk: string) => void
  ): Promise<string> {
    const response = await this.queryAI(query);
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullText = '';

    if (!reader) {
      throw new Error('Stream failed: no readable body');
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      fullText += chunk;
      onChunk(chunk);
    }

    return fullText;
  },

  // 3. ElevenLabs Streaming (fallback for single-shot)
  async textToSpeech(text: string): Promise<ArrayBuffer> {
    const response = await fetch(`${SUPABASE_FN_URL}/eleven-speak`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`Text-to-speech failed: ${response.statusText}`);
    }

    return response.arrayBuffer();
  },

  // 4. Deepgram STT
  async transcribeAudio(audioBlob: Blob): Promise<string> {
    const formData = new FormData();
    formData.append('audio', audioBlob);

    const response = await fetch(`${SUPABASE_FN_URL}/deepgram-transcribe`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Transcription failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.transcript || data.text || '';
  }
};
