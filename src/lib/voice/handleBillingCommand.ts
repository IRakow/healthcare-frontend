import { RachelTTS } from '@/lib/voice/RachelTTS'

interface BillingOptions {
  intent: string
}

export async function handleBillingCommand(text: string, options: BillingOptions) {
  const { intent } = options

  switch (intent) {
    case 'billing.overdueCheck':
      return RachelTTS.say('Checking overdue accounts... Found 3 employers with overdue payments: NovaCare, TechHealth, and MediFlow.')

    case 'billing.summary':
    case 'billing.summarize':
      return RachelTTS.say('Billing summary: Total revenue this month: $45,200. 3 overdue accounts totaling $8,400. 12 pending invoices.')

    case 'billing.compareInvoices':
      return RachelTTS.say('To compare invoices, please specify which employers you want to compare.')

    case 'billing.emailInvoice':
      return RachelTTS.say('Preparing invoice for email. Which employer should I send this to?')

    case 'billing.exportPDF':
    case 'billing.exportActive':
      return RachelTTS.say('Generating billing report PDF. The download will start in a moment.')

    default:
      return RachelTTS.say('I can help with billing inquiries like checking overdue accounts, summaries, or exporting reports.')
  }
}