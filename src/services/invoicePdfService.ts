export const invoicePdfService = {
  async generateInvoicePdf(employerId: string, month: string): Promise<string> {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_FN_BASE}/generate-invoice-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ employerId, month }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate PDF');
    }

    const data = await response.json();
    return data.pdf_url;
  },

  async generateAllInvoicePdfs(month: string): Promise<{ success: number; failed: number; results: any[] }> {
    // Get all invoices for the month
    const { invoiceService } = await import('./invoiceService');
    const invoices = await invoiceService.getInvoicesWithEmployers();
    const monthInvoices = invoices.filter(inv => inv.month === month);

    const results = {
      success: 0,
      failed: 0,
      results: [] as any[]
    };

    // Generate PDFs in parallel (batch of 3 at a time to avoid overwhelming the server)
    const batchSize = 3;
    for (let i = 0; i < monthInvoices.length; i += batchSize) {
      const batch = monthInvoices.slice(i, i + batchSize);
      const promises = batch.map(async (invoice) => {
        try {
          const pdfUrl = await this.generateInvoicePdf(invoice.employer_id, invoice.month);
          results.success++;
          results.results.push({
            employer: invoice.employer_name,
            status: 'success',
            pdf_url: pdfUrl
          });
        } catch (error) {
          results.failed++;
          results.results.push({
            employer: invoice.employer_name,
            status: 'failed',
            error: error.message
          });
        }
      });

      await Promise.all(promises);
    }

    return results;
  }
};