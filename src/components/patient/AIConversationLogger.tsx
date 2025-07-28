import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Calendar, 
  MessageSquare, 
  User, 
  Bot, 
  Clock,
  Filter,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Heart,
  Activity,
  FileText,
  Loader2,
  Mic,
  Volume2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/hooks/useUser';
import { format } from 'date-fns';

interface AIConversation {
  id: string;
  session_id: string;
  created_at: string;
  topic: string;
  category: string;
  mode: 'text' | 'voice';
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
  summary?: string;
}

const categoryIcons: Record<string, React.ReactNode> = {
  'symptoms': <Heart className="w-4 h-4" />,
  'medications': <FileText className="w-4 h-4" />,
  'appointments': <Calendar className="w-4 h-4" />,
  'general': <MessageSquare className="w-4 h-4" />,
  'vitals': <Activity className="w-4 h-4" />
};

const categoryColors: Record<string, string> = {
  'symptoms': 'bg-red-100 text-red-700',
  'medications': 'bg-purple-100 text-purple-700',
  'appointments': 'bg-blue-100 text-blue-700',
  'general': 'bg-gray-100 text-gray-700',
  'vitals': 'bg-green-100 text-green-700'
};

export const AIConversationLogger: React.FC = () => {
  const { userId } = useUser();
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedConversations, setExpandedConversations] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (userId) {
      loadConversations();
    }
  }, [userId]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      
      // Get patient ID
      const { data: patient } = await supabase
        .from('patients')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (!patient) {
        // Use demo data if no patient found
        setConversations([
          {
            id: '1',
            session_id: 'demo-1',
            created_at: new Date().toISOString(),
            topic: 'Understanding A1C Levels',
            category: 'vitals',
            mode: 'text',
            messages: [
              {
                role: 'user',
                content: 'What does a high A1C mean?',
                timestamp: new Date().toISOString()
              },
              {
                role: 'assistant',
                content: 'A high A1C level indicates that your average blood sugar has been elevated over the past 2-3 months. An A1C above 6.5% typically indicates diabetes, while 5.7-6.4% suggests prediabetes. It\'s important to work with your healthcare provider to manage blood sugar levels through diet, exercise, and potentially medication.',
                timestamp: new Date().toISOString()
              }
            ],
            summary: 'Discussed A1C levels and their significance in diabetes management'
          },
          {
            id: '2',
            session_id: 'demo-2',
            created_at: new Date(Date.now() - 86400000).toISOString(),
            topic: 'Dietary Advice for Cholesterol',
            category: 'symptoms',
            mode: 'voice',
            messages: [
              {
                role: 'user',
                content: 'Should I eat eggs every day if I have high cholesterol?',
                timestamp: new Date(Date.now() - 86400000).toISOString()
              },
              {
                role: 'assistant',
                content: 'For most people with high cholesterol, eating eggs in moderation (3-4 per week) is generally safe. Recent research shows that dietary cholesterol has less impact on blood cholesterol than previously thought. Focus on limiting saturated fats and trans fats instead. However, individual responses vary, so discuss with your doctor.',
                timestamp: new Date(Date.now() - 86400000).toISOString()
              }
            ],
            summary: 'Provided guidance on egg consumption with high cholesterol'
          }
        ]);
        return;
      }

      // Load AI conversations
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('patient_id', patient.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data
      const formattedConversations: AIConversation[] = (data || []).map(conv => ({
        id: conv.id,
        session_id: conv.session_id,
        created_at: conv.created_at,
        topic: conv.topic || 'Health Consultation',
        category: conv.category || 'general',
        mode: conv.mode || 'text',
        messages: conv.messages || [],
        summary: conv.summary
      }));

      setConversations(formattedConversations);
    } catch (error) {
      console.error('Failed to load AI conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (conversationId: string) => {
    const newExpanded = new Set(expandedConversations);
    if (newExpanded.has(conversationId)) {
      newExpanded.delete(conversationId);
    } else {
      newExpanded.add(conversationId);
    }
    setExpandedConversations(newExpanded);
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = searchTerm === '' || 
      conv.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.messages.some(msg => msg.content.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || conv.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today at ${format(date, 'h:mm a')}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'MMM d, yyyy h:mm a');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <div className="flex gap-2 flex-wrap">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
              >
                All
              </Button>
              {Object.keys(categoryIcons).map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="flex items-center gap-1"
                >
                  {categoryIcons[category]}
                  <span className="capitalize">{category}</span>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conversations List */}
      {filteredConversations.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No AI conversations found</p>
            <p className="text-sm text-gray-400 mt-2">
              Your AI health assistant conversations will appear here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredConversations.map((conversation) => (
            <motion.div
              key={conversation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="overflow-hidden">
                <CardHeader 
                  className="cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleExpanded(conversation.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-full">
                        {categoryIcons[conversation.category] || <MessageSquare className="w-4 h-4" />}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{conversation.topic}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {formatTimestamp(conversation.created_at)}
                          </span>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${categoryColors[conversation.category] || categoryColors.general}`}
                          >
                            {conversation.category}
                          </Badge>
                          {conversation.mode === 'voice' && (
                            <Badge variant="outline" className="text-xs">
                              <Mic className="w-3 h-3 mr-1" />
                              Voice
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {conversation.messages.length} messages
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      {expandedConversations.has(conversation.id) ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                
                {expandedConversations.has(conversation.id) && (
                  <CardContent className="border-t bg-gray-50/50">
                    {conversation.summary && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-900 mb-1">Summary</p>
                        <p className="text-sm text-blue-700">{conversation.summary}</p>
                      </div>
                    )}
                    
                    <div className="space-y-3">
                      {conversation.messages.map((message, index) => (
                        <div
                          key={index}
                          className={`flex gap-3 ${
                            message.role === 'user' ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`flex gap-3 max-w-[80%] ${
                              message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                            }`}
                          >
                            <div className={`p-2 rounded-full ${
                              message.role === 'user' 
                                ? 'bg-primary text-white' 
                                : 'bg-gray-200'
                            }`}>
                              {message.role === 'user' ? (
                                <User className="w-4 h-4" />
                              ) : (
                                <Bot className="w-4 h-4" />
                              )}
                            </div>
                            <div
                              className={`p-3 rounded-lg ${
                                message.role === 'user'
                                  ? 'bg-primary text-white'
                                  : 'bg-white border'
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                              <p className={`text-xs mt-1 ${
                                message.role === 'user' ? 'text-blue-100' : 'text-muted-foreground'
                              }`}>
                                {format(new Date(message.timestamp), 'h:mm a')}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      <Card className="bg-gradient-to-r from-blue-50 to-sky-50">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-4">AI Assistant Insights</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{conversations.length}</p>
              <p className="text-sm text-muted-foreground">Total Conversations</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {conversations.filter(c => c.category === 'symptoms').length}
              </p>
              <p className="text-sm text-muted-foreground">Symptom Discussions</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {conversations.filter(c => c.category === 'medications').length}
              </p>
              <p className="text-sm text-muted-foreground">Medication Queries</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {conversations.reduce((acc, conv) => acc + conv.messages.length, 0)}
              </p>
              <p className="text-sm text-muted-foreground">Total Messages</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};