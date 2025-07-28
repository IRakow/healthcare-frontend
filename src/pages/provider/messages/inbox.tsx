import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Send, MessageCircle, User, Clock } from 'lucide-react';

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
  patient?: {
    full_name: string;
  };
  last_message?: Message;
  unread_count?: number;
}

export default function ProviderMessages() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadThreads();
  }, []);

  useEffect(() => {
    if (selectedThread) {
      loadMessages(selectedThread.id);
    }
  }, [selectedThread]);

  useEffect(() => {
    scrollToBottom();
    markMessagesAsRead();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  async function loadThreads() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: threads } = await supabase
        .from('message_threads')
        .select('*')
        .eq('provider_id', user.id);

      if (threads) {
        // Get unread counts and last messages
        const threadsWithDetails = await Promise.all(
          threads.map(async (thread: any) => {
            const { data: lastMsg } = await supabase
              .from('messages')
              .select('*')
              .eq('thread_id', thread.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();

            const { count } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('thread_id', thread.id)
              .eq('recipient_id', user.id)
              .eq('seen', false);

            return {
              ...thread,
              last_message: lastMsg,
              unread_count: count || 0
            };
          })
        );

        setThreads(threadsWithDetails);
      }
    } catch (error) {
      console.error('Error loading threads:', error);
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
    if (!selectedThread || messages.length === 0) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('messages')
      .update({ seen: true })
      .eq('thread_id', selectedThread.id)
      .eq('recipient_id', user.id)
      .eq('seen', false);

    // Update local thread state
    setThreads(threads.map(t => 
      t.id === selectedThread.id ? { ...t, unread_count: 0 } : t
    ));
  }

  async function sendMessage() {
    if (!text.trim() || !selectedThread) return;

    setSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const newMessage = {
        sender_id: user.id,
        recipient_id: selectedThread.patient_id,
        thread_id: selectedThread.id,
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
        
        // Update thread's last message
        setThreads(threads.map(t => 
          t.id === selectedThread.id 
            ? { ...t, last_message: data }
            : t
        ));
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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="p-6 max-w-screen-xl mx-auto">
        <div className="text-center">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Messages</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Thread List */}
        <div className="md:col-span-1">
          <Card>
            <div className="p-4 border-b">
              <h2 className="font-semibold">Conversations</h2>
            </div>
            <div className="divide-y max-h-[600px] overflow-y-auto">
              {threads.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No conversations yet
                </div>
              ) : (
                threads.map((thread) => (
                  <div
                    key={thread.id}
                    onClick={() => setSelectedThread(thread)}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedThread?.id === thread.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{thread.patient?.full_name}</p>
                            {thread.unread_count! > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {thread.unread_count}
                              </Badge>
                            )}
                          </div>
                          {thread.last_message && (
                            <p className="text-sm text-gray-600 truncate">
                              {thread.last_message.message}
                            </p>
                          )}
                        </div>
                      </div>
                      {thread.last_message && (
                        <span className="text-xs text-gray-500">
                          {formatTime(thread.last_message.created_at)}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Message View */}
        <div className="md:col-span-2">
          {selectedThread ? (
            <Card className="h-[600px] flex flex-col">
              <div className="p-4 border-b">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-semibold">{selectedThread.patient?.full_name}</p>
                    <p className="text-sm text-gray-600">Patient</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-3">
                  {messages.map((msg) => {
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
                          <div className={`flex items-center gap-1 mt-1 ${
                            isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            <Clock className="h-3 w-3" />
                            <p className="text-xs">
                              {new Date(msg.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                            {isOwnMessage && msg.seen && (
                              <span className="text-xs ml-1">✓✓</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    disabled={sending}
                  />
                  <Button 
                    onClick={sendMessage} 
                    disabled={sending || !text.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="h-[600px] flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Select a conversation to view messages</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}