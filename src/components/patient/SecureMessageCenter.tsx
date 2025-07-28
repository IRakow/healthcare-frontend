import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SendHorizontal, 
  MessageSquare, 
  Paperclip, 
  Check, 
  CheckCheck,
  AlertCircle,
  Loader2,
  Lock
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/hooks/useUser';

interface Message {
  id: string;
  sender_id: string;
  sender_role: 'patient' | 'provider' | 'admin';
  sender_name: string;
  recipient_id: string;
  content: string;
  timestamp: string;
  read: boolean;
  thread_id: string;
  attachments?: string[];
  urgent?: boolean;
}

interface MessageThread {
  id: string;
  patient_id: string;
  provider_id: string;
  provider_name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  status: 'active' | 'resolved';
}

export const SecureMessageCenter: React.FC = () => {
  const { userId, role } = useUser();
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [typing, setTyping] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      loadThreads();
      subscribeToMessages();
    }
  }, [userId]);

  useEffect(() => {
    if (selectedThread) {
      loadMessages(selectedThread);
      markMessagesAsRead(selectedThread);
    }
  }, [selectedThread]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadThreads = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('message_threads')
        .select(`
          *,
          provider:providers(name),
          messages:messages(count)
        `)
        .eq('patient_id', userId)
        .order('last_message_time', { ascending: false });

      if (error) throw error;

      const formattedThreads = (data || []).map(thread => ({
        ...thread,
        provider_name: thread.provider?.name || 'Unknown Provider'
      }));

      setThreads(formattedThreads);
      
      // Auto-select first thread if exists
      if (formattedThreads.length > 0 && !selectedThread) {
        setSelectedThread(formattedThreads[0].id);
      }
    } catch (error) {
      console.error('Failed to load message threads:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (threadId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:auth.users(email, user_metadata)
        `)
        .eq('thread_id', threadId)
        .order('timestamp', { ascending: true });

      if (error) throw error;

      const formattedMessages = (data || []).map(msg => ({
        ...msg,
        sender_name: msg.sender?.user_metadata?.full_name || msg.sender?.email || 'Unknown'
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const markMessagesAsRead = async (threadId: string) => {
    try {
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('thread_id', threadId)
        .eq('recipient_id', userId)
        .eq('read', false);

      // Update unread count in threads
      setThreads(prev => prev.map(thread => 
        thread.id === threadId ? { ...thread, unread_count: 0 } : thread
      ));
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`messages:${userId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `recipient_id=eq.${userId}`
        }, 
        (payload) => {
          const newMessage = payload.new as Message;
          
          // Update messages if in current thread
          if (selectedThread === newMessage.thread_id) {
            setMessages(prev => [...prev, newMessage]);
            markMessagesAsRead(newMessage.thread_id);
          } else {
            // Update thread list
            loadThreads();
          }
          
          // Show notification
          if (Notification.permission === 'granted') {
            new Notification('New Message', {
              body: newMessage.content,
              icon: '/icon-192x192.png'
            });
          }
        }
      )
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        // Handle typing indicators
        Object.keys(state).forEach(key => {
          const presence = state[key][0];
          if (presence.typing && presence.user_id !== userId) {
            setTyping(presence.user_id);
            setTimeout(() => setTyping(null), 3000);
          }
        });
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  };

  const sendMessage = async () => {
    if (!input.trim() || !selectedThread) return;
    
    setSending(true);
    const thread = threads.find(t => t.id === selectedThread);
    
    try {
      const newMessage = {
        thread_id: selectedThread,
        sender_id: userId,
        sender_role: role as 'patient',
        recipient_id: thread?.provider_id,
        content: input.trim(),
        timestamp: new Date().toISOString(),
        read: false
      };

      const { data, error } = await supabase
        .from('messages')
        .insert(newMessage)
        .select()
        .single();

      if (error) throw error;

      // Update thread's last message
      await supabase
        .from('message_threads')
        .update({
          last_message: input.trim(),
          last_message_time: new Date().toISOString()
        })
        .eq('id', selectedThread);

      setInput('');
      
      // Add to timeline
      await supabase.from('patient_timeline').insert({
        patient_id: userId,
        type: 'message',
        title: 'Sent Message',
        content: `Message to ${thread?.provider_name}`,
        timestamp: new Date().toISOString(),
        importance: 'low'
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit' 
      });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur shadow h-[600px] flex"
    >
      {/* Thread List */}
      <div className="w-1/3 border-r border-gray-200 p-4 overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Messages
        </h3>
        
        {threads.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No messages yet
          </p>
        ) : (
          <div className="space-y-2">
            {threads.map(thread => (
              <motion.div
                key={thread.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedThread(thread.id)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedThread === thread.id 
                    ? 'bg-blue-50 border border-blue-200' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {thread.provider_name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {thread.last_message}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs text-gray-500">
                      {formatTime(thread.last_message_time)}
                    </span>
                    {thread.unread_count > 0 && (
                      <Badge variant="default" className="text-xs px-1.5 py-0">
                        {thread.unread_count}
                      </Badge>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Message Area */}
      <div className="flex-1 flex flex-col">
        {selectedThread ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h4 className="font-semibold">
                  {threads.find(t => t.id === selectedThread)?.provider_name}
                </h4>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  End-to-end encrypted
                </p>
              </div>
              <Badge variant="outline">
                {threads.find(t => t.id === selectedThread)?.status || 'active'}
              </Badge>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`flex ${
                      message.sender_id === userId ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-xl ${
                        message.sender_id === userId
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {message.urgent && (
                        <div className="flex items-center gap-1 mb-1">
                          <AlertCircle className="w-3 h-3" />
                          <span className="text-xs font-medium">Urgent</span>
                        </div>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs opacity-70">
                          {formatTime(message.timestamp)}
                        </span>
                        {message.sender_id === userId && (
                          message.read ? (
                            <CheckCheck className="w-3 h-3" />
                          ) : (
                            <Check className="w-3 h-3" />
                          )
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {typing && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                  </div>
                  <span>Provider is typing...</span>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <Button variant="ghost" size="icon">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Input
                  placeholder="Type a secure message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  className="flex-1"
                />
                <Button 
                  onClick={sendMessage} 
                  disabled={sending || !input.trim()}
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <SendHorizontal className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Messages are encrypted and HIPAA compliant
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};