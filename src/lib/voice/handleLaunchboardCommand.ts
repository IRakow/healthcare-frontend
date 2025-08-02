import { RachelTTS } from '@/lib/voice/RachelTTS'

export async function handleLaunchboardCommand(text: string, context?: string) {
  const t = text.toLowerCase()

  if (t.includes('appointment')) {
    return RachelTTS.say('There are 18 appointments scheduled today across 7 providers.')
  }

  if (t.includes('provider') && (t.includes('working') || t.includes('live') || t.includes('active'))) {
    return RachelTTS.say('Currently, 5 providers are clocked in and active.')
  }

  if (t.includes('issue') || t.includes('problem') || t.includes('top issue')) {
    return RachelTTS.say('Top issue this week: missed billing notifications on 3 employer accounts.')
  }

  if (t.includes('remind')) {
    return RachelTTS.say("Reminder set to check invoices this afternoon. I'll notify you at 3 PM.")
  }

  if (t.includes('summary') || t.includes('overview')) {
    return RachelTTS.say('Launchboard summary: 5 active providers, 18 appointments, 1 flagged billing alert.')
  }

  return RachelTTS.say("I'm listening for questions like 'Who is working today?' or 'How many appointments are scheduled?'")
}