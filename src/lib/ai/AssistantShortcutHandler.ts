import { RachelTTS } from '@/lib/voice/RachelTTS'
import { navigate } from 'wouter'

export const AssistantShortcutHandler = {
  async handle(command: string) {
    const normalized = command.toLowerCase().trim()

    if (normalized.includes('last pdf') || normalized.includes('open export')) {
      await RachelTTS.say('Opening your most recent export.')
      navigate('/admin/pdf/last')
      return true
    }

    if (normalized.includes('go to settings') || normalized.includes('change settings')) {
      await RachelTTS.say('Taking you to system settings.')
      navigate('/admin/settings')
      return true
    }

    if (normalized.includes('view backups')) {
      await RachelTTS.say('Navigating to backup management.')
      navigate('/admin/backup')
      return true
    }

    return false // not matched
  }
}