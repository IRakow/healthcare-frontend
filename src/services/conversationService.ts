import { supabase } from '@/lib/api'

export type ConversationMessage = {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  created_at: string
}

export type MessageCallback = (message: ConversationMessage) => void

export function subscribeToConversation(
  conversationId: string,
  callback: MessageCallback
) {
  const channel = supabase
    .channel(`conversation:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'conversation_messages',
        filter: `conversation_id=eq.${conversationId}`
      },
      (payload) => {
        const newMessage = payload.new as ConversationMessage
        callback(newMessage)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

export const conversationService = {
  subscribeToConversation
}
