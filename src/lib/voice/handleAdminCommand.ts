import { supabase } from '@/lib/supabase';
import { speak } from './RachelTTSQueue';
import { handleNavigationIntent } from './handleNavigationIntent';
import { handleThreadFollowup } from './handleThreadFollowup';
import { callOpenAI, callGemini } from '@/lib/ai/aiRouter';
import { useRachelMemoryStore } from './useRachelMemoryStore';
import { store } from '@/lib/voice/voiceMemoryStore';
import { handleMutationCommand } from './handleMutationCommand';

export async function handleAdminCommand(text: string) {
  const cleaned = text.trim().toLowerCase();

  // 💡 Route to specific handlers first
  if (cleaned.includes('go to') || cleaned.includes('open')) {
    return handleNavigationIntent(cleaned);
  }

  // Check for mutation commands
  if (await handleMutationCommand(cleaned)) return;

  if (cleaned.includes('repeat that')) {
    const last = store.getState().lastSpoken;
    return last ? speak(last) : speak("I don't have anything to repeat.");
  }

  if (cleaned.includes('export audit')) {
    const { data, error } = await supabase.from('audit_logs').select('*').limit(500);
    if (error || !data) return speak("There was an error exporting the audit logs.");
    const summary = `Exported ${data.length} audit entries. Ready for review.`;
    // TODO: Hook up PDF export or CSV if needed
    return speak(summary);
  }

  if (cleaned.includes('how many admins')) {
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'admin');
    if (error) return speak("Couldn't fetch admin count.");
    return speak(`There are currently ${count} admins in the system.`);
  }

  if (cleaned.includes('recent invoices')) {
    const { data, error } = await supabase.from('invoices').select('id, total_amount, created_at').order('created_at', { ascending: false }).limit(5);
    if (error) return speak("Failed to fetch invoice data.");
    const formatted = data.map(i => `Invoice ${i.id} for ${i.total_amount}`).join(', ');
    return speak(`Here are the latest invoices: ${formatted}`);
  }

  if (cleaned.includes('settings')) {
    return speak(`You're in ${import.meta.env.MODE} environment. Rachel voice is active.`);
  }

  // 🌐 AI ROUTING FOR COMPLEX QUERIES
  const aiResponse = await callOpenAIOrGemini(cleaned);
  return aiResponse;
}

async function callOpenAIOrGemini(prompt: string) {
  const medicalKeywords = ['HIPAA', 'compliance', 'audit', 'protected data'];
  const useGemini = medicalKeywords.some(keyword => prompt.toLowerCase().includes(keyword));

  const result = useGemini ? await callGemini(prompt) : await callOpenAI(prompt);
  if (result?.text) {
    speak(result.text);
    store.getState().setLastSpoken(result.text);
    return;
  }
  return speak("I'm having trouble processing that. Please try again.");
}