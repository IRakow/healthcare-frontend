import type { Request, Response } from 'express';
import { supabase } from '@/lib/supabase';
import { generateInvoicePdf } from '@/utils/generateInvoicePdf';

export default async function handler(req: Request, res: Response) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Invoice ID is required' });
  }

  try {
    // Fetch invoice with employer data
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select(`
        *,
        employer:employers(*),
        appointment_charges(*)
      `)
      .eq('id', id)
      .single();

    if (error || !invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Check if PDF already exists
    if (invoice.pdf_url) {
      // Redirect to existing PDF
      return res.redirect(invoice.pdf_url);
    }

    // Generate PDF on the fly
    // For Next.js/Vercel, we'll redirect to the edge function
    const edgeFunctionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-invoice-pdf`;
    
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({
        employerId: invoice.employer_id,
        month: invoice.month
      })
    });

    const data = await response.json();
    
    if (data.pdf_url) {
      res.redirect(data.pdf_url);
    } else {
      res.status(500).json({ error: 'Failed to generate PDF' });
    }
  } catch (error) {
    console.error('Error handling invoice PDF request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}