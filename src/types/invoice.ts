export interface Invoice {
  id: string;
  employer_id: string;
  month: string; // Format: 'YYYY-MM'
  total_amount: number;
  status: InvoiceStatus;
  pdf_url: string | null;
  created_at: string;
  updated_at?: string;
}

export type InvoiceStatus = 'Pending' | 'Paid' | 'Overdue' | 'Processing';

export interface CreateInvoiceInput {
  employer_id: string;
  month: string;
  total_amount: number;
  status: InvoiceStatus;
  pdf_url?: string | null;
}

export interface UpdateInvoiceInput {
  total_amount?: number;
  status?: InvoiceStatus;
  pdf_url?: string | null;
}

// Extended invoice with employer information
export interface InvoiceWithEmployer extends Invoice {
  employer_name: string;
  billing_plan: 'per_member' | 'flat_rate';
  custom_invoice_note: string | null;
}

// Helper function to format month
export function formatInvoiceMonth(month: string): string {
  const [year, monthNum] = month.split('-');
  const date = new Date(parseInt(year), parseInt(monthNum) - 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

// Helper function to get current month in invoice format
export function getCurrentInvoiceMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  return `${year}-${month}`;
}