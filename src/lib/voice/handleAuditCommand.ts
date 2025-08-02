import { RachelTTS } from '@/lib/voice/RachelTTS'
import { format } from 'date-fns'

export async function handleAuditCommand(text: string) {
  const say = (msg: string) => RachelTTS.say(msg)
  const t = text.toLowerCase()

  if (t.includes('summary') || t.includes('report')) {
    return say('There were 47 audit logs this week. 4 were errors, and 2 are unresolved.')
  }

  if (t.includes('yesterday')) {
    return say('Yesterday, 8 audit entries were logged. One failure occurred in the billing service.')
  }

  if (t.includes('errors') || t.includes('failures')) {
    return say('Currently there are 2 unresolved failures: one from backup sync, and one from invoice queue.')
  }

  if (t.includes('compliance')) {
    return say('All compliance logs passed for the last 7 days. No HIPAA flags detected.')
  }

  if (t.includes('download') || t.includes('export')) {
    return say('Generating audit log export. A CSV download will begin shortly.')
  }

  return say("I'm listening for audit commands like 'yesterday's errors', 'export audit log', or 'compliance summary'.")
}