import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const client = createClient(supabaseUrl, serviceRoleKey);

    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
    
    if (!SENDGRID_API_KEY) {
      throw new Error('SENDGRID_API_KEY not configured');
    }

    const { employer_id, month } = await req.json();

    // Fetch employer data
    const { data: employer, error: employerError } = await client
      .from('employers')
      .select('*')
      .eq('id', employer_id)
      .single();

    if (employerError) throw employerError;

    // Fetch invoice data
    const { data: invoice, error: invoiceError } = await client
      .from('invoices')
      .select('*')
      .eq('employer_id', employer_id)
      .eq('month', month)
      .single();

    if (invoiceError) throw invoiceError;

    // Format month for display
    const formatMonth = (monthStr: string) => {
      const [year, month] = monthStr.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    // Use custom_invoice_note as billing email if no billing_email field exists
    const billingEmail = employer.billing_email || employer.email || 'billing@example.com';

    // Send email via SendGrid
    const emailRes = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: billingEmail }],
            subject: `Invoice for ${employer.name} – ${formatMonth(month)}`,
          },
        ],
        from: { 
          email: 'invoices@purityhealth.ai', 
          name: 'Purity Health Billing' 
        },
        content: [
          {
            type: 'text/html',
            value: `
              <!DOCTYPE html>
              <html>
              <head>
                <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background-color: ${employer.primary_color || '#3b82f6'}; color: white; padding: 30px; text-align: center; }
                  .content { padding: 30px; background-color: #f9fafb; }
                  .invoice-details { background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                  .amount { font-size: 24px; font-weight: bold; color: ${employer.primary_color || '#3b82f6'}; }
                  .button { display: inline-block; padding: 12px 30px; background-color: ${employer.primary_color || '#3b82f6'}; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                  .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>Invoice from Purity Health</h1>
                  </div>
                  
                  <div class="content">
                    <h2>Hello ${employer.name},</h2>
                    <p>Your invoice for ${formatMonth(month)} is now available.</p>
                    
                    <div class="invoice-details">
                      <h3>Invoice Details</h3>
                      <p><strong>Invoice ID:</strong> ${invoice.id.slice(0, 8)}</p>
                      <p><strong>Billing Period:</strong> ${formatMonth(month)}</p>
                      <p><strong>Status:</strong> ${invoice.status}</p>
                      <p class="amount">Total Amount: $${invoice.total_amount.toLocaleString()}</p>
                    </div>
                    
                    ${employer.custom_invoice_note ? `<p><em>${employer.custom_invoice_note}</em></p>` : ''}
                    
                    ${invoice.pdf_url ? `
                      <center>
                        <a href="${invoice.pdf_url}" class="button">Download Invoice PDF</a>
                      </center>
                    ` : ''}
                    
                    <p>If you have any questions about this invoice, please don't hesitate to contact our billing department.</p>
                  </div>
                  
                  <div class="footer">
                    <p>Thank you for your business!</p>
                    <p>Purity Health | invoices@purityhealth.ai</p>
                    ${employer.subdomain ? `<p>${employer.subdomain}.purityhealth.ai</p>` : ''}
                  </div>
                </div>
              </body>
              </html>
            `,
          },
        ],
      }),
    });

    if (!emailRes.ok) {
      const error = await emailRes.text();
      throw new Error(`SendGrid error: ${emailRes.status} - ${error}`);
    }

    // Update invoice status to indicate email was sent
    await client
      .from('invoices')
      .update({ 
        updated_at: new Date().toISOString(),
        // You could add an 'email_sent_at' field to track this
      })
      .eq('id', invoice.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Invoice email sent to ${billingEmail}`,
        invoice_id: invoice.id,
        employer: employer.name
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 400,
      }
    );
  }
});