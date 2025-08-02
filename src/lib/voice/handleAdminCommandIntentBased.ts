import { classifyIntent } from '@/lib/ai/classifyIntent'
import { RachelTTS } from '@/lib/voice/RachelTTS'
import { handleBillingCommand } from './handleBillingCommand'
import { handleAuditCommand } from './handleAuditCommand'
import { handleUserCommand } from './handleUserCommand'
import { handleLaunchboardCommand } from './handleLaunchboardCommand'

export async function handleAdminCommand(text: string, context: string = '') {
  const intent = classifyIntent(text, context)

  switch (intent) {
    // Billing
    case 'billing.overdueCheck':
    case 'billing.summary':
    case 'billing.compareInvoices':
    case 'billing.emailInvoice':
    case 'billing.exportPDF':
    case 'billing.exportActive':
    case 'billing.summarize':
      return handleBillingCommand(text, { intent })

    // Audit
    case 'audit.failureCheck':
    case 'audit.yesterdayReview':
    case 'audit.complianceReport':
    case 'audit.exportLogs':
    case 'audit.exportActive':
    case 'audit.summarize':
      return handleAuditCommand(text, { intent })

    // Users
    case 'users.count':
    case 'users.createPrompt':
      return handleUserCommand(text, { intent })

    // Rachel Launchboard
    case 'launchboard.overview':
    case 'launchboard.providers':
    case 'launchboard.appointments':
    case 'launchboard.reminder':
    case 'launchboard.summary':
      return handleLaunchboardCommand(text, context)

    default:
      return RachelTTS.say("I'm not sure how to help with that. Try saying something like 'billing summary' or 'show audit errors'.")
  }
}