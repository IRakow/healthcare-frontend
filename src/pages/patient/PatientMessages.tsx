// src/pages/patient/PatientMessages.tsx

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { fetchFromOpenAI } from '@/lib/ai/openai';
import { speak } from '@/lib/voice/RachelTTSQueue';
import { useUser } from '@/hooks/useUser';

interface Message {
  id: string;
  content: string;
  sender: string;
  created_at: string;
}

export default function PatientMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [aiSuggest, setAiSuggest] = useState('');
  const [loading, setLoading] = useState(false);
  const [silentMode, setSilentMode] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    loadMessages();
    const saved = localStorage.getItem('silent_mode');
    setSilentMode(saved === 'true');
  }, []);

  async function loadMessages() {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true })
      .eq('user_id', user?.id);
    if (data) setMessages(data);
  }

  async function sendMessage() {
    if (!newMsg.trim()) return;
    setLoading(true);
    await supabase.from('messages').insert({ content: newMsg, sender: 'patient', user_id: user?.id });
    setNewMsg('');
    loadMessages();
    setLoading(false);
  }

  async function getAISuggestion() {
    if (!messages.length) return;
    const recent = messages.slice(-3).map(m => `${m.sender}: ${m.content}`).join('\n');
    const result = await fetchFromOpenAI({
      prompt: `Based on this patient-provider thread, suggest a polite follow-up message:
${recent}`,
      system: 'You are an AI trained in healthcare etiquette. Be respectful, clear, and supportive.'
    });
    if (result?.text) {
      setAiSuggest(result.text);
      if (!silentMode) speak(result.text);
    }
  }

  return (
    <div className="min-h-screen p-6 pb-28 bg-gradient-to-b from-white via-gray-50 to-indigo-100">
      <h1 className="text-3xl font-bold tracking-tight mb-6 text-center">💬 Secure Messages</h1>

      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="bg-white/80">
          <CardContent className="p-4 space-y-3 max-h-[50vh] overflow-y-auto">
            {messages.length === 0 ? (
              <p className="text-muted-foreground">No messages yet.</p>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="text-sm">
                  <span className="font-semibold text-gray-700">{msg.sender === 'provider' ? '🩺 Provider' : '🧑‍💼 You'}</span>: {msg.content}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <div className="space-y-2">
          <Textarea
            placeholder="Type your message..."
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            rows={3}
            className="text-sm"
          />
          <div className="flex items-center gap-2">
            <Button onClick={sendMessage} disabled={loading}>
              Send Message
            </Button>
            <Button variant="ghost" onClick={getAISuggestion}>
              🤖 Suggest with AI
            </Button>
          </div>

          {aiSuggest && (
            <div className="text-sm bg-white/70 p-3 border rounded-md text-muted-foreground">
              <strong>💡 Suggested:</strong> {aiSuggest}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}