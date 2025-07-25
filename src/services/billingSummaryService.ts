export const billingSummaryService = {
  // Generate AI summary for billing data
  async generateSummary(params: {
    month?: string;
    employerId?: string;
    rawData?: string;
  }): Promise<string> {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_FN_BASE}/billing-summary-ai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate billing summary');
    }

    const data = await response.json();
    return data.summary;
  },

  // Generate monthly billing report
  async generateMonthlyReport(month: string): Promise<string> {
    return this.generateSummary({ month });
  },

  // Generate employer-specific billing analysis
  async generateEmployerAnalysis(employerId: string): Promise<string> {
    return this.generateSummary({ employerId });
  },

  // Generate custom summary from raw data
  async generateCustomSummary(rawData: string): Promise<string> {
    return this.generateSummary({ rawData });
  }
};