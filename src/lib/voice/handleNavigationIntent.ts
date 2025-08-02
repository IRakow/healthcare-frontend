import { useRouter } from 'next/router'
import { speak } from './RachelTTSQueue'

export async function handleNavigationIntent(text: string): Promise<boolean> {
  const t = text.toLowerCase()
  const router = useRouter()

  if (t.includes('go to') || t.includes('navigate') || t.includes('open')) {
    if (t.includes('audit')) {
      speak('Opening audit logs.')
      router.push('/admin/audit-log')
      return true
    }
    if (t.includes('compliance')) {
      speak('Taking you to the compliance center.')
      router.push('/admin/compliance')
      return true
    }
    if (t.includes('reports') || t.includes('usage')) {
      speak('Opening AI reports dashboard.')
      router.push('/admin/ai-reports')
      return true
    }
    if (t.includes('billing')) {
      speak('Opening the billing center.')
      router.push('/admin/billing')
      return true
    }

    speak('I didn't catch where you want to go.')
    return true
  }

  return false
}