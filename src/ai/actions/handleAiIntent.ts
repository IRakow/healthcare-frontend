import { supabase } from '@/lib/supabase';

export async function handleAiIntent(userId: string, parsed: any, command: string) {
  try {
    // Call the voice-commands edge function
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session) {
      return '❌ Please log in to perform this action';
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
    const functionUrl = `${supabaseUrl}/functions/v1/voice-commands`;

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.session.access_token}`,
      },
      body: JSON.stringify({
        user_id: userId,
        command,
        parsed
      }),
    });

    const result = await response.json();
    
    if (!response.ok || result.error) {
      throw new Error(result.reply || 'Command execution failed');
    }

    return result.reply || '✅ Action completed successfully';
  } catch (error) {
    console.error('AI intent error:', error);
    return `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
}