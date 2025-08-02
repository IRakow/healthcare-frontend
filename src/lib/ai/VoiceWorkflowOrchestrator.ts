import { RachelTTS } from '@/lib/voice/RachelTTS'
import { IntentParser } from './IntentParser'

let isIdle = false

export const VoiceWorkflowOrchestrator = {
  async init() {
    if (!isIdle) {
      await RachelTTS.say("I can help with anything. Say 'create a report' or 'trigger backup'.")
      isIdle = true
    }
  },

  async handleCommand(command: string) {
    isIdle = false
    const result = await IntentParser.handle(command)
    await RachelTTS.say(result.feedback)
    result.action?.()
  }
}