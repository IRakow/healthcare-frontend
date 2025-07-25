import { useState, useEffect } from 'react';
import { conversationService } from '@/services/conversationService';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  Search, 
  Clock, 
  User,
  Trash2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { format } from 'date-fns';

interface Conversation {
  id: string;
  user_id: string;
  input: string;
  output: string;
  created_at: string;
  user_email?: string;
  user_name?: string;
}

export default function ConversationHistory({ adminView = false }: { adminView?: boolean }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchConversations();

    // Subscribe to new conversations
    const unsubscribe = conversationService.subscribeToConversations((newConv) => {
      setConversations(prev => [newConv, ...prev]);
    });

    return () => unsubscribe();
  }, [adminView]);

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const data = adminView 
        ? await conversationService.getAllConversations()
        : await conversationService.getUserConversations();
      
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchConversations();
      return;
    }

    setLoading(true);
    try {
      const results = await conversationService.searchConversations(searchTerm);
      setConversations(results);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this conversation?')) {
      const success = await conversationService.deleteConversation(id);
      if (success) {
        setConversations(prev => prev.filter(c => c.id !== id));
      }
    }
  };

  const toggleExpanded = (id: string) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch}>Search</Button>
      </div>

      {/* Conversations List */}
      {conversations.length === 0 ? (
        <Card className="text-center py-12">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No conversations found</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {conversations.map((conversation) => {
            const isExpanded = expandedIds.has(conversation.id);
            const inputPreview = conversation.input.length > 100 
              ? conversation.input.substring(0, 100) + '...' 
              : conversation.input;

            return (
              <Card key={conversation.id} className="hover:shadow-md transition-shadow">
                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      {adminView && (
                        <>
                          <User className="w-4 h-4" />
                          <span>{conversation.user_name || conversation.user_email || 'Anonymous'}</span>
                          <span className="text-gray-400">•</span>
                        </>
                      )}
                      <Clock className="w-4 h-4" />
                      <span>{format(new Date(conversation.created_at), 'MMM dd, yyyy HH:mm')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleExpanded(conversation.id)}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                      {!adminView && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(conversation.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Input */}
                  <div className="mb-3">
                    <p className="text-sm font-medium text-gray-700 mb-1">Question:</p>
                    <p className="text-sm text-gray-600">
                      {isExpanded ? conversation.input : inputPreview}
                    </p>
                  </div>

                  {/* Output */}
                  {(isExpanded || conversation.output.length <= 150) && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Response:</p>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">
                        {conversation.output}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}