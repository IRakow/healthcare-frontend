import { supabase } from '@/lib/supabase';

interface Conversation {
  id?: string;
  user_id?: string;
  input: string;
  output?: string;
  created_at?: string;
}

export const conversationService = {
  // Save a new conversation
  async saveConversation(input: string, output: string) {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('ai_conversations')
        .insert({
          user_id: user.user?.id,
          input,
          output
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving conversation:', error);
      return null;
    }
  },

  // Get user's conversation history
  async getUserConversations(limit: number = 50) {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('user_id', user.user?.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
  },

  // Get all conversations (admin only)
  async getAllConversations(limit: number = 100) {
    try {
      const { data, error } = await supabase
        .from('ai_conversations_with_users')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching all conversations:', error);
      return [];
    }
  },

  // Search conversations
  async searchConversations(searchTerm: string) {
    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .or(`input.ilike.%${searchTerm}%,output.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error searching conversations:', error);
      return [];
    }
  },

  // Get conversation statistics
  async getConversationStats() {
    try {
      // Get total count
      const { count: totalCount } = await supabase
        .from('ai_conversations')
        .select('*', { count: 'exact', head: true });

      // Get today's count
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { count: todayCount } = await supabase
        .from('ai_conversations')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      // Get unique users count
      const { data: uniqueUsers } = await supabase
        .from('ai_conversations')
        .select('user_id')
        .not('user_id', 'is', null);
      
      const uniqueUserCount = new Set(uniqueUsers?.map(u => u.user_id)).size;

      return {
        total: totalCount || 0,
        today: todayCount || 0,
        uniqueUsers: uniqueUserCount
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      return { total: 0, today: 0, uniqueUsers: 0 };
    }
  },

  // Delete a conversation
  async deleteConversation(id: string) {
    try {
      const { error } = await supabase
        .from('ai_conversations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      return false;
    }
  },

  // Real-time subscription
  subscribeToConversations(callback: (conversation: any) => void) {
    const subscription = supabase
      .channel('conversations-channel')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'ai_conversations' 
        }, 
        (payload) => {
          callback(payload.new);
        }
      )
      .subscribe();

    return () => subscription.unsubscribe();
  }
};