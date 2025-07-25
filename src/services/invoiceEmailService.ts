export const invoiceEmailService = {
  async sendInvoiceEmail(employerId: string, month: string): Promise<any> {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_FN_BASE}/send-invoice-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ employer_id: employerId, month }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send invoice email');
    }

    return response.json();
  },

  async sendBulkInvoiceEmails(month: string): Promise<{
    sent: number;
    failed: number;
    results: any[];
  }> {
    // Get all invoices for the month with employer data
    const { invoiceService } = await import('./invoiceService');
    const invoices = await invoiceService.getInvoicesWithEmployers();
    const monthInvoices = invoices.filter(
      inv => inv.month === month && inv.status !== 'Paid'
    );

    const results = {
      sent: 0,
      failed: 0,
      results: [] as any[]
    };

    // Send emails in batches to avoid overwhelming the server
    const batchSize = 5;
    for (let i = 0; i < monthInvoices.length; i += batchSize) {
      const batch = monthInvoices.slice(i, i + batchSize);
      
      const promises = batch.map(async (invoice) => {
        try {
          await this.sendInvoiceEmail(invoice.employer_id, invoice.month);
          results.sent++;
          results.results.push({
            employer: invoice.employer_name,
            status: 'sent',
            invoice_id: invoice.id
          });
        } catch (error) {
          results.failed++;
          results.results.push({
            employer: invoice.employer_name,
            status: 'failed',
            error: error.message,
            invoice_id: invoice.id
          });
        }
      });

      await Promise.all(promises);
      
      // Add delay between batches to respect rate limits
      if (i + batchSize < monthInvoices.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  }
};