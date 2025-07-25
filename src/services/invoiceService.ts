import { supabase } from '@/lib/supabase';
import { Invoice, CreateInvoiceInput, UpdateInvoiceInput, InvoiceWithEmployer } from '@/types/invoice';

export const invoiceService = {
  // Generate monthly invoices via Edge Function
  async generateMonthlyInvoices(month?: string) {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_FN_BASE}/generate-monthly-invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ month })
    });

    if (!response.ok) {
      throw new Error(`Failed to generate invoices: ${response.statusText}`);
    }

    return response.json();
  },

  // Get all invoices
  async getInvoices(): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .order('month', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get invoices with employer information
  async getInvoicesWithEmployers(): Promise<InvoiceWithEmployer[]> {
    const { data, error } = await supabase
      .from('invoice_summaries')
      .select('*')
      .order('month', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get invoices for a specific employer
  async getEmployerInvoices(employerId: string): Promise<Invoice[]> {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('employer_id', employerId)
      .order('month', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get single invoice
  async getInvoice(id: string): Promise<Invoice | null> {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create invoice
  async createInvoice(input: CreateInvoiceInput): Promise<Invoice> {
    const { data, error } = await supabase
      .from('invoices')
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update invoice
  async updateInvoice(id: string, input: UpdateInvoiceInput): Promise<Invoice> {
    const { data, error } = await supabase
      .from('invoices')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Mark invoice as paid
  async markAsPaid(id: string, pdfUrl?: string): Promise<Invoice> {
    const updateData: UpdateInvoiceInput = { status: 'Paid' };
    if (pdfUrl) updateData.pdf_url = pdfUrl;
    
    return this.updateInvoice(id, updateData);
  },

  // Delete invoice
  async deleteInvoice(id: string): Promise<void> {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};