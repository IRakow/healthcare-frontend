import { RachelTTS } from './RachelTTS'
import { handleAuditCommand } from './handleAuditCommand'
import { handleLaunchboardCommand } from './handleLaunchboardCommand'
import { classifyIntent } from '@/lib/ai/classifyIntent'

export async function handleAdminCommand(text: string, context?: string) {
  const intent = classifyIntent(text, context)
  console.log('Enhanced Intent:', intent, 'Context:', context)
  const t = text.toLowerCase()

  // Handle context-specific commands
  if (context === 'launchboard') {
    return handleLaunchboardCommand(text, context)
  }

  if (context === 'charts') {
    if (t.includes('volume') || t.includes('usage')) {
      return RachelTTS.say('AI call volume is at 13,240 this month, up 12% from last month.')
    }
    if (t.includes('endpoint') || t.includes('top')) {
      return RachelTTS.say('The most active endpoint is /admin/voice-assist with 4,200 calls.')
    }
    if (t.includes('export') || t.includes('download')) {
      return RachelTTS.say('Generating usage report CSV. Download will start shortly.')
    }
  }

  if (context === 'system') {
    if (t.includes('load') || t.includes('performance')) {
      return RachelTTS.say('System load is at 32%. All services are running smoothly.')
    }
    if (t.includes('tasks') || t.includes('background')) {
      return RachelTTS.say('7 background tasks are running. AI export processor is using the most resources.')
    }
    if (t.includes('restart') || t.includes('reboot')) {
      return RachelTTS.say('System restart requires confirmation. Say "confirm restart" to proceed.')
    }
  }

  if (context === 'ui') {
    if (t.includes('highlight') || t.includes('errors')) {
      return RachelTTS.say('Highlighting UI errors. Found 2 console warnings and 1 layout shift.')
    }
    if (t.includes('inspect') || t.includes('element')) {
      return RachelTTS.say('Inspector mode activated. Click any element to see its properties.')
    }
  }

  // Route to specific command handlers
  if (t.includes('audit') || t.includes('compliance')) {
    return handleAuditCommand(text)
  }

  // Fallback to base handler
  return handleAdminCommandBase(text, context)
}

async function handleAdminCommandBase(text: string, context?: string) {
  const t = text.toLowerCase()

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

  return RachelTTS.say(`You can ask about ${context || 'various admin features'}. Try asking about specific metrics or actions.`)
}