const SUPABASE_PROJECT_URL = import.meta.env.VITE_SUPABASE_FN_BASE || 'https://dhycdcugbjchktvqlroz.functions.supabase.co';

export const voiceAPI = {
  // AI Voice Query - Send text query to GPT-4
  async queryAI(query: string): Promise<Response> {
    const response = await fetch(`${SUPABASE_PROJECT_URL}/ai-voice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`AI Voice request failed: ${response.statusText}`);
    }

    return response;
  },

  // Text to Speech - Convert text to audio using Eleven Labs
  async textToSpeech(text: string): Promise<ArrayBuffer> {
    const response = await fetch(`${SUPABASE_PROJECT_URL}/eleven-speak`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`Text-to-speech request failed: ${response.statusText}`);
    }

    return response.arrayBuffer();
  },

  // Speech to Text - Transcribe audio using Deepgram
  async transcribeAudio(audioBlob: Blob): Promise<string> {
    const formData = new FormData();
    formData.append('audio', audioBlob);

    const response = await fetch(`${SUPABASE_PROJECT_URL}/deepgram-transcribe`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Transcription request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.transcript || data.text || '';
  },

  // Stream AI response with chunk processing
  async streamAIResponse(
    query: string, 
    onChunk: (chunk: string) => void
  ): Promise<string> {
    const response = await this.queryAI(query);
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullResponse = '';

    if (!reader) {
      throw new Error('Response body is not readable');
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value, { stream: true });
      fullResponse += chunk;
      onChunk(chunk);
    }

    return fullResponse;
  }
};