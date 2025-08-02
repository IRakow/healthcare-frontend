import { speak } from './RachelTTSQueue'

export async function handleNavigationIntent(text: string): Promise<boolean> {
  const t = text.toLowerCase()

  if (t.includes('go to') || t.includes('navigate') || t.includes('open')) {
    if (t.includes('audit')) {
      speak('Opening audit logs.')
      // Navigation should be handled by the calling component
      window.location.href = '/admin/audit-log'
      return true
    }
    if (t.includes('compliance')) {
      speak('Taking you to the compliance center.')
      window.location.href = '/admin/compliance'
      return true
    }
    if (t.includes('reports') || t.includes('usage')) {
      speak('Opening AI reports dashboard.')
      window.location.href = '/admin/ai-reports'
      return true
    }
    if (t.includes('billing')) {
      speak('Opening the billing center.')
      window.location.href = '/admin/billing'
      return true
    }

    speak("I didn't catch where you want to go.")
    return true
  }

  return false
}