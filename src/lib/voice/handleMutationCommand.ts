// src/lib/voice/handleMutationCommand.ts

import { supabase } from '@/lib/supabase';
import { speak } from './RachelTTSQueue';

/**
 * Rachel's mutation engine: parses voice commands and executes system updates.
 * Requires natural language input like "Disable employer Smith Wellness" or "Set patient cap to 300".
 */
export async function handleMutationCommand(command: string): Promise<boolean> {
  const text = command.toLowerCase();

  // === Employer Activation ===
  const employerMatch = text.match(/(enable|disable|deactivate|activate) employer (.+)/);
  if (employerMatch) {
    const action = employerMatch[1];
    const name = employerMatch[2].trim();
    const enable = ['enable', 'activate'].includes(action);
    const { error } = await supabase
      .from('employers')
      .update({ active: enable })
      .ilike('name', `%${name}%`);

    if (error) {
      speak(`Failed to update employer status for ${name}`);
      return true;
    }
    speak(`${name} has been ${enable ? 'enabled' : 'disabled'}.`);
    return true;
  }

  // === Feature Toggle ===
  const featureMatch = text.match(/(enable|disable) (.+) feature/);
  if (featureMatch) {
    const action = featureMatch[1];
    const feature = featureMatch[2].trim().replace(/\s+/g, '_').toLowerCase();
    const enabled = action === 'enable';
    const { error } = await supabase
      .from('features')
      .update({ enabled })
      .eq('key', feature);

    if (error) {
      speak(`Could not ${action} the ${feature} feature.`);
      return true;
    }
    speak(`The ${feature} feature is now ${enabled ? 'enabled' : 'disabled'}.`);
    return true;
  }

  // === Patient Cap Change ===
  const capMatch = text.match(/set (?:the )?(?:patient|member) cap (?:for )?(.*?) to (\d+)/);
  if (capMatch) {
    const employer = capMatch[1].trim();
    const cap = parseInt(capMatch[2]);
    const { error } = await supabase
      .from('employers')
      .update({ max_patients: cap })
      .ilike('name', `%${employer}%`);

    if (error) {
      speak(`Unable to update the patient cap for ${employer}`);
      return true;
    }
    speak(`The cap for ${employer} has been updated to ${cap}`);
    return true;
  }

  // === Unknown Command ===
  // Return false if no mutation commands matched
  return false;
}