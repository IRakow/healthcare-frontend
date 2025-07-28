import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Clock, User, Send } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageModal } from '@/components/ui/MessageModal';

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  recipient_name?: string;
  content: string;
  sent_at: string;
  read_at?: string;
  sender?: {
    email?: string;
    raw_user_meta_data?: {
      name?: string;
      avatar_url?: string;
    };
  };
}

export const SecureMessageInbox: React.FC = () => {
  const { userId } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replyRecipient, setReplyRecipient] = useState('');
  const [replyRecipientId, setReplyRecipientId] = useState('');

  useEffect(() => {
    if (userId) {
      loadMessages();
      
      // Subscribe to new messages
      const subscription = supabase
        .channel('secure-messages')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'secure_messages',
          filter: `recipient_id=eq.${userId}`
        }, (payload) => {
          loadMessages(); // Reload messages when new one arrives
        })
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [userId]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('secure_messages')
        .select(`
          *,
          sender:auth.users!sender_id(
            email,
            raw_user_meta_data
          )
        `)
        .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
        .order('sent_at', { ascending: false });

      if (!error && data) {
        setMessages(data as Message[]);
        
        // Mark messages as read
        const unreadMessages = data.filter(m => m.recipient_id === userId && !m.read_at);
        if (unreadMessages.length > 0) {
          await supabase
            .from('secure_messages')
            .update({ read_at: new Date().toISOString() })
            .in('id', unreadMessages.map(m => m.id));
        }
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = (senderId: string, senderName: string) => {
    setReplyRecipientId(senderId);
    setReplyRecipient(senderName);
    setReplyModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur p-6 shadow space-y-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          Secure Messages
        </h3>
        <Badge variant="outline" className="text-xs">
          {messages.length} {messages.length === 1 ? 'Message' : 'Messages'}
        </Badge>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">Loading messages...</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-8">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No messages yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Messages from your care team will appear here
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {messages.map((msg) => {
            const isReceived = msg.recipient_id === userId;
            const senderName = msg.sender?.raw_user_meta_data?.name || msg.sender?.email || 'Unknown';
            const senderAvatar = msg.sender?.raw_user_meta_data?.avatar_url;
            
            return (
              <motion.li 
                key={msg.id} 
                initial={{ opacity: 0, x: isReceived ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${isReceived ? 'justify-start' : 'justify-end'}`}
              >
                <Card className={`max-w-[80%] p-4 ${isReceived ? 'bg-gray-50' : 'bg-primary/5'}`}>
                  <div className="flex items-start gap-3">
                    {isReceived && (
                      senderAvatar ? (
                        <img 
                          src={senderAvatar} 
                          alt={senderName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                      )
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-sm font-medium">
                          {isReceived ? senderName : 'You'}
                        </span>
                        {!msg.read_at && isReceived && (
                          <Badge variant="default" className="text-xs">New</Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {msg.content}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(msg.sent_at)}
                        </div>
                        
                        {isReceived && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleReply(msg.sender_id, senderName)}
                            className="text-xs"
                          >
                            <Send className="w-3 h-3 mr-1" />
                            Reply
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.li>
            );
          })}
        </ul>
      )}

      {/* Reply Modal */}
      <MessageModal 
        isOpen={replyModalOpen} 
        onClose={() => {
          setReplyModalOpen(false);
          loadMessages(); // Reload messages after sending
        }} 
        recipient={replyRecipient}
        recipientId={replyRecipientId}
      />
    </motion.div>
  );
};