import { useState } from 'react';
import { Mic, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RxSpinner } from '@/components/ui/spinner/RxSpinner';
import { supabase } from '@/lib/supabase';

export default function MedicalSynthesizer() {
  const [query, setQuery] = useState('');
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);

  async function handleSubmit() {
    if (!query.trim()) return;
    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const baseUrl = import.meta.env.VITE_SUPABASE_FN_BASE || 'https://dhycdcugbjchktvqlroz.functions.supabase.co';
      
      const res = await fetch(`${baseUrl}/medical-synthesizer`, {
        method: 'POST',
        body: JSON.stringify({ query, userId: user?.id }),
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
      });
      
      const { reply } = await res.json();
      setReply(reply);
      speak(reply);
    } catch (error) {
      console.error('Error:', error);
      setReply('Unable to process your request. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function speak(text: string) {
    try {
      const baseUrl = import.meta.env.VITE_SUPABASE_FN_BASE || 'https://dhycdcugbjchktvqlroz.functions.supabase.co';
      const res = await fetch(`${baseUrl}/eleven-speak`, {
        method: 'POST',
        body: JSON.stringify({ text }),
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
      });
      
      const buffer = await res.arrayBuffer();
      const ctx = new AudioContext();
      const decoded = await ctx.decodeAudioData(buffer);
      const source = ctx.createBufferSource();
      source.buffer = decoded;
      source.connect(ctx.destination);
      source.start();
    } catch (error) {
      console.error('Text-to-speech error:', error);
    }
  }

  function recordVoice() {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      setRecording(true);

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        setRecording(false);
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const buffer = await blob.arrayBuffer();
        
        try {
          const baseUrl = import.meta.env.VITE_SUPABASE_FN_BASE || 'https://dhycdcugbjchktvqlroz.functions.supabase.co';
          const res = await fetch(`${baseUrl}/deepgram-transcribe`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'audio/webm',
              'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
            },
            body: buffer,
          });
          
          const json = await res.json();
          const text = json.results?.channels?.[0]?.alternatives?.[0]?.transcript;
          if (text) {
            setQuery(text);
          }
        } catch (error) {
          console.error('Transcription error:', error);
        }
        
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setTimeout(() => recorder.stop(), 5000);
    }).catch(error => {
      console.error('Microphone access error:', error);
      alert('Please allow microphone access to use voice input.');
    });
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-center text-blue-700">🩺 Medical Information Synthesizer</h1>
      
      <Card>
        <textarea
          rows={3}
          placeholder="Describe your symptoms or ask a medical question..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 text-sm bg-white/90"
        />
        <div className="flex justify-end mt-2 gap-2">
          <Button onClick={handleSubmit} disabled={loading || !query.trim()}>
            <Send className="w-4 h-4 mr-2" />
            Submit
          </Button>
          <Button variant="secondary" onClick={recordVoice} disabled={recording}>
            <Mic className={`w-4 h-4 mr-2 ${recording ? 'text-red-500' : ''}`} />
            {recording ? 'Recording...' : 'Voice'}
          </Button>
        </div>
      </Card>

      {loading && <RxSpinner />}

      {reply && (
        <Card title="Synthesized Medical Summary">
          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap text-sm font-sans">{reply}</pre>
          </div>
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              ⚠️ This is general medical information only. Always consult a licensed healthcare provider for diagnosis and treatment.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}