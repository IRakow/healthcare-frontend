import { useState } from 'react';
import { Mic, Send } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

export function AssistantBar() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!query.trim()) return;
    setLoading(true);

    // Get Supabase URL from the client
    const supabaseUrl = (supabase as any).supabaseUrl || import.meta.env.VITE_SUPABASE_URL;
    
    const res = await fetch(`${supabaseUrl}/functions/v1/ai-voice`, {
      method: 'POST',
      body: JSON.stringify({ query }),
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(supabase as any).supabaseKey || import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
    });

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    const audioChunks: Uint8Array[] = [];
    let finalText = '';

    while (reader) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      finalText += chunk;

      // Send the chunk to ElevenLabs TTS via Supabase Function
      const audioRes = await fetch(`${supabaseUrl}/functions/v1/eleven-speak`, {
        method: 'POST',
        body: JSON.stringify({ text: chunk }),
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(supabase as any).supabaseKey || import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
      });

      const audioBuffer = await audioRes.arrayBuffer();
      audioChunks.push(new Uint8Array(audioBuffer));
      playAudio(audioBuffer); // play each chunk
    }

    setLoading(false);
  }

  function playAudio(buffer: ArrayBuffer) {
    const ctx = new AudioContext();
    ctx.decodeAudioData(buffer.slice(0), (decoded) => {
      const source = ctx.createBufferSource();
      source.buffer = decoded;
      source.connect(ctx.destination);
      source.start(0);
    });
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur border shadow-xl w-[95%] sm:w-[700px] rounded-2xl px-4 py-3 flex items-center gap-3 z-50">
      <Input
        placeholder="Ask anything..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
      />
      <Button onClick={handleSubmit} disabled={loading}>
        <Send className="w-4 h-4" />
      </Button>
      <Button variant="secondary" onClick={() => alert('Voice input coming soon')}>
        <Mic className="w-4 h-4" />
      </Button>
    </div>
  );
}