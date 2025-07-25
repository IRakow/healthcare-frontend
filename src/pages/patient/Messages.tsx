import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, MessageCircle } from 'lucide-react';

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  message: string;
  seen: boolean;
  created_at: string;
}

interface Thread {
  id: string;
  patient_id: string;
  provider_id: string;
  provider?: {
    full_name: string;
  };
}

export default function Messages() {
  const [thread, setThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadThread();
  }, []);

  useEffect(() => {
    scrollToBottom();
    markMessagesAsRead();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  async function loadThread() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get or create thread with primary provider
      const { data: existingThread } = await supabase
        .from('message_threads')
        .select(`
          *,
          provider:provider_id(full_name)
        `)
        .eq('patient_id', user.id)
        .maybeSingle();

      if (existingThread) {
        setThread(existingThread);
        await loadMessages(existingThread.id);
      } else {
        // Get first available provider for new thread
        const { data: providers } = await supabase
          .from('users')
          .select('id, full_name')
          .eq('role', 'provider')
          .limit(1)
          .single();

        if (providers) {
          // Create new thread
          const { data: newThread } = await supabase
            .from('message_threads')
            .insert({
              patient_id: user.id,
              provider_id: providers.id
            })
            .select()
            .single();

          if (newThread) {
            setThread({ ...newThread, provider: providers });
          }
        }
      }
    } catch (error) {
      console.error('Error loading thread:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadMessages(threadId: string) {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at');
    
    setMessages(data || []);
  }

  async function markMessagesAsRead() {
    if (!thread || messages.length === 0) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Mark all unread messages as read
    await supabase
      .from('messages')
      .update({ seen: true })
      .eq('thread_id', thread.id)
      .eq('recipient_id', user.id)
      .eq('seen', false);
  }

  async function sendMessage() {
    if (!text.trim() || !thread) return;

    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const newMessage = {
        sender_id: user.id,
        recipient_id: thread.provider_id,
        thread_id: thread.id,
        message: text.trim()
      };

      const { data, error } = await supabase
        .from('messages')
        .insert(newMessage)
        .select()
        .single();

      if (!error && data) {
        setMessages([...messages, data]);
        setText('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="text-center">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <MessageCircle className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Messages</h1>
        {thread?.provider && (
          <span className="text-sm text-gray-600">
            with Dr. {thread.provider.full_name}
          </span>
        )}
      </div>

      <Card>
        <div className="p-4 border-b">
          <p className="text-sm text-gray-600">
            {messages.length === 0 
              ? 'Start a conversation with your provider' 
              : `${messages.length} messages`}
          </p>
        </div>

        <div className="p-4 space-y-3 h-96 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No messages yet. Send a message to start the conversation.</p>
            </div>
          ) : (
            messages.map((msg) => {
              const { data: { user } } = supabase.auth.getUser();
              const isOwnMessage = msg.sender_id === user?.id;
              
              return (
                <div
                  key={msg.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      isOwnMessage
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                    <p className={`text-xs mt-1 ${
                      isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {new Date(msg.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={sending || !thread}
            />
            <Button 
              onClick={sendMessage} 
              disabled={sending || !text.trim() || !thread}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}