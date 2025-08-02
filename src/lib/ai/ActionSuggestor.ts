import { IntentMemory } from './IntentMemory'
import { RachelTTS } from '../voice/RachelTTS'

export const ActionSuggestor = {
  async suggest() {
    const last = IntentMemory.getLast()
    if (!last) return

    // Suggest based on last route or response
    if (last.route?.includes('invoices')) {
      await RachelTTS.say('You last viewed invoices. Would you like me to send a payment reminder?')
    } else if (last.prompt.includes('backup')) {
      await RachelTTS.say('Would you like to download the most recent backup now?')
    } else if (last.prompt.includes('employer')) {
      await RachelTTS.say('Should I also generate a summary report for that employer?')
    }
  }
}