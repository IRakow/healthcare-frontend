// src/lib/voice/rachelIntentRouter.ts

import { speak } from './RachelTTSQueue';
import { executeAdminSkill } from './RachelAdminPowers';
import { setMemory } from './RachelMemoryStore';
import { fetchFromGemini } from '@/lib/ai/gemini';

export async function handleRachelIntent(text: string, role: 'admin' | 'patient' | 'provider') {
  const cleaned = text.trim().toLowerCase();

  if (!cleaned) return speak("Please enter a command.");

  // === ADMIN INTENTS ===
  if (role === 'admin') {
    if (cleaned.includes('show all providers')) {
      setMemory('admin_user_filter', 'provider');
      return speak('Filtering to providers');
    }

    if (cleaned.includes('created this week')) {
      setMemory('admin_user_filter', 'created_this_week');
      return speak('Showing users created this week');
    }

    const promoteMatch = cleaned.match(/promote (.+) to (admin|owner|provider)/);
    if (promoteMatch) {
      const name = promoteMatch[1].trim();
      const role = promoteMatch[2];
      await executeAdminSkill('save_user_memory', { key: 'promote_intent', value: `${name}=>${role}` });
      return speak(`Queued promotion of ${name} to ${role}`);
    }

    if (cleaned.includes('generate report')) {
      return executeAdminSkill('generate_pdf_report', { type: 'invoices' });
    }

    return speak("Command received. If nothing happens, it may require a visual component.");
  }

  // === PATIENT INTENTS ===
  if (role === 'patient') {
    if (cleaned.includes('book')) {
      return executeAdminSkill('save_user_memory', { key: 'patient_booking', value: cleaned });
    }
    if (cleaned.includes('start meditation')) {
      return executeAdminSkill('save_user_memory', { key: 'start_meditation', value: cleaned });
    }
    if (cleaned.includes('explain') || cleaned.includes('what does')) {
      const response = await fetchFromGemini({
        prompt: cleaned,
        context: 'You are a safe and structured medical assistant. Respond with educational guidance, not diagnosis. Always end by recommending consultation with a licensed provider.'
      });
      return speak(response?.text || 'I had trouble processing that.');
    }
    if (cleaned.includes('snack') || cleaned.includes('meal')) {
      const response = await fetchFromGemini({
        prompt: cleaned,
        context: 'You are a health and dietary assistant. Provide medically sound, goal-oriented suggestions for snacks, meals, and nutrition guidance.'
      });
      return speak(response?.text || 'I could not find a suggestion at the moment.');
    }
    return speak("Command registered. A provider will respond or your data will be updated shortly.");
  }

  // === PROVIDER INTENTS ===
  if (role === 'provider') {
    if (cleaned.includes('review')) {
      return executeAdminSkill('save_user_memory', { key: 'review_queue', value: cleaned });
    }
    if (cleaned.includes('summarize')) {
      return executeAdminSkill('generate_pdf_report', { type: 'provider_summary' });
    }
    return speak("Command acknowledged. Navigating to provider workspace.");
  }

  // === Default fallback for all roles ===
  const result = await fetchFromGemini({
    prompt: cleaned,
    context: 'You are an intelligent assistant with system access. Handle non-medical questions thoughtfully and route users to the appropriate section if needed.'
  });
  return speak(result?.text || "I don't yet understand that, but I'm learning.");
}