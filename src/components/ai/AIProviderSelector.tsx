import { useState } from 'react';
import { Mic, Send, Sparkles, Brain } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Select from '@/components/ui/select';
import { supabase } from '@/lib/supabase';

type AIProvider = 'openai' | 'gemini';

export function AIProviderSelector() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState<AIProvider>('openai');
  const [response, setResponse] = useState('');
  const [isListening, setIsListening] = useState(false);

  async function handleSubmit() {
    if (!query.trim()) return;
    setLoading(true);
    setResponse('');

    const supabaseUrl = (supabase as any).supabaseUrl || import.meta.env.VITE_SUPABASE_URL;
    const functionName = provider === 'openai' ? 'ai-voice' : 'gemini-chat';
    
    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
        method: 'POST',
        body: JSON.stringify({ query }),
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(supabase as any).supabaseKey || import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullResponse += chunk;
        setResponse(fullResponse);

        // Optional: Send to TTS for voice output
        if (chunk.length > 20) {
          const audioRes = await fetch(`${supabaseUrl}/functions/v1/eleven-speak`, {
            method: 'POST',
            body: JSON.stringify({ text: chunk }),
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${(supabase as any).supabaseKey || import.meta.env.VITE_SUPABASE_ANON_KEY}`
            },
          });

          const audioBuffer = await audioRes.arrayBuffer();
          playAudio(audioBuffer);
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setResponse('Sorry, an error occurred while processing your request.');
    } finally {
      setLoading(false);
    }
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

  async function startVoiceInput() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    
    setIsListening(true);
    
    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setQuery(text);
      setIsListening(false);
    };
    
    recognition.onerror = () => {
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.start();
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-lg border shadow-2xl w-[95%] sm:w-[750px] rounded-3xl px-6 py-4 z-50">
      <div className="flex items-center gap-3 mb-3">
        <Select
          value={provider}
          onChange={(v) => setProvider(v as AIProvider)}
          options={[
            { value: 'openai', label: 'OpenAI' },
            { value: 'gemini', label: 'Gemini' }
          ]}
          className="w-[140px]"
        />
        
        <Input
          placeholder={`Ask ${provider === 'openai' ? 'GPT-4' : 'Gemini'} anything...`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          className="flex-1"
        />
        
        <Button 
          onClick={handleSubmit} 
          disabled={loading || !query.trim()}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Send className="w-4 h-4" />
        </Button>
        
        <Button 
          variant="secondary" 
          onClick={startVoiceInput}
          disabled={isListening}
          className={isListening ? 'bg-red-100 text-red-600' : ''}
        >
          <Mic className={`w-4 h-4 ${isListening ? 'animate-pulse' : ''}`} />
        </Button>
      </div>
      
      {response && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{response}</p>
        </div>
      )}
      
      {loading && (
        <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
          <span>Thinking...</span>
        </div>
      )}
    </div>
  );
}