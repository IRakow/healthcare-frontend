export function classifyIntent(text: string, context: string = '') {
  const t = text.toLowerCase()

  if (context === 'billing') {
    if (t.includes('unpaid') || t.includes('overdue') || t.includes('not paid')) return 'billing.overdueCheck'
    if (t.includes('compare') && t.includes('invoice')) return 'billing.compareInvoices'
    if (t.includes('email') || t.includes('send')) return 'billing.emailInvoice'
    if (t.includes('download') || t.includes('pdf')) return 'billing.exportPDF'
    if (t.includes('summary') || t.includes('report')) return 'billing.summary'
  }

  if (context === 'audit') {
    if (t.includes('error') || t.includes('failures') || t.includes('issue')) return 'audit.failureCheck'
    if (t.includes('yesterday')) return 'audit.yesterdayReview'
    if (t.includes('compliance')) return 'audit.complianceReport'
    if (t.includes('export') || t.includes('csv')) return 'audit.exportLogs'
  }

  if (context === 'launchboard') {
    if (t.includes('appointment')) return 'launchboard.appointments'
    if (t.includes('provider') && (t.includes('working') || t.includes('available') || t.includes('live'))) return 'launchboard.providers'
    if (t.includes('remind') || t.includes('reminder')) return 'launchboard.reminder'
    if (t.includes('summary') || t.includes('overview')) return 'launchboard.summary'
  }

  if (context === 'users') {
    if (t.includes('how many') || t.includes('admins')) return 'users.count'
    if (t.includes('add user') || t.includes('create')) return 'users.createPrompt'
  }

  return 'unknown'
}