import { navigate } from 'wouter'

interface IntentResponse {
  feedback: string
  action?: () => void
}

export const IntentParser = {
  async handle(prompt: string): Promise<IntentResponse> {
    const res = await fetch('/api/ai/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    })

    const json = await res.json()

    const command = json.intent?.toLowerCase() || ''
    const payload = json.payload || {}

    // Map commands to actions
    switch (true) {
      case command.includes('open audit'):
        return { feedback: 'Opening audit logs...', action: () => navigate('/admin/audit-log') }
      case command.includes('show invoices'):
        return { feedback: 'Taking you to invoices...', action: () => navigate('/admin/invoices') }
      case command.includes('download backup'):
        return { feedback: 'Navigating to backup tools...', action: () => navigate('/admin/backup') }
      case command.includes('create employer'):
        return {
          feedback: `Creating a new employer called ${payload.name}`,
          action: () => fetch('/api/employer/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: payload.name })
          })
        }
      case command.includes('export pdf'):
        return {
          feedback: 'Generating your export now...',
          action: () => fetch('/api/pdf/export', { method: 'POST' })
        }
      default:
        return { feedback: `I'm not sure how to help with that yet.` }
    }
  }
}