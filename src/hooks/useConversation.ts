import { useState, useCallback } from 'react';
import { conversationService } from '@/services/conversationService';

export function useConversation() {
  const [saving, setSaving] = useState(false);

  const saveConversation = useCallback(async (input: string, output: string) => {
    if (!input || !output) return null;
    
    setSaving(true);
    try {
      const conversation = await conversationService.saveConversation(input, output);
      return conversation;
    } catch (error) {
      console.error('Error saving conversation:', error);
      return null;
    } finally {
      setSaving(false);
    }
  }, []);

  return {
    saveConversation,
    saving
  };
}