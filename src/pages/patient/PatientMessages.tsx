import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function PatientMessages() {
  const [threadId, setThreadId] = useState('');
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  const user = supabase.auth.user();

  useEffect(() => {
    (async () => {
      const { data: thread } = await supabase
        .from('message_threads')
        .select('*')
        .eq('patient_id', user.id)
        .maybeSingle();

      if (thread) {
        setThreadId(thread.id);
        const { data } = await supabase
          .from('messages')
          .select('*')
          .eq('thread_id', thread.id)
          .order('created_at');
        setMessages(data || []);
      }
    })();
  }, []);

  async function send() {
    await supabase.from('messages').insert({
      sender_id: user.id,
      recipient_id: '', // add default provider ID if applicable
      thread_id: threadId,
      message: text
    });

    setMessages([...messages, { sender_id: user.id, message: text }]);
    setText('');
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">💬 Messages</h1>
      <Card>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {messages.map((m, i) => (
            <div key={i} className={`text-sm ${m.sender_id === user.id ? 'text-right' : 'text-left'}`}>
              <span className="inline-block px-3 py-1 rounded-xl bg-gray-100 text-gray-800">
                {m.message}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type your message..." />
          <Button onClick={send}>Send</Button>
        </div>
      </Card>
    </div>
  );
}