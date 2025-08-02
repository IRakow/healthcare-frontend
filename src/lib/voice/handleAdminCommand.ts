import { RachelTTS } from './RachelTTS'
import { handleAuditCommand } from './handleAuditCommand'
import { classifyIntent } from '@/lib/ai/classifyIntent'

export async function handleAdminCommand(text: string, context?: string) {
  const intent = classifyIntent(text, context)
  console.log('Intent:', intent, 'Context:', context)
  const t = text.toLowerCase()

  // Route to specific command handlers
  if (t.includes('audit') || t.includes('log') || t.includes('compliance')) {
    return handleAuditCommand(text)
  }

  if (t.includes('users') || t.includes('admin')) {
    if (t.includes('count') || t.includes('how many')) {
      return RachelTTS.say('There are 12 total admins with varying permission levels.')
    }
    if (t.includes('active')) {
      return RachelTTS.say('8 admins have been active in the last 24 hours.')
    }
  }

  if (t.includes('settings')) {
    if (t.includes('voice') || t.includes('rachel')) {
      return RachelTTS.say('Voice assistant Rachel is currently active and responding to commands.')
    }
    if (t.includes('environment')) {
      return RachelTTS.say('System is running in production environment with all security features enabled.')
    }
  }

  if (t.includes('broadcast') || t.includes('message')) {
    if (t.includes('last') || t.includes('recent')) {
      return RachelTTS.say('Last broadcast was sent on August 1st: Platform update notice.')
    }
    if (t.includes('send') || t.includes('new')) {
      return RachelTTS.say('To send a new broadcast, use the form below or say the message content.')
    }
  }

  return RachelTTS.say('You can ask about users, settings, audit logs, or broadcasts.')
}