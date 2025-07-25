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

    // Get invoice ID from URL path or query params
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const invoiceId = pathParts[pathParts.length - 1] || url.searchParams.get('id');

    if (!invoiceId) {
      return new Response(
        JSON.stringify({ error: 'Invoice ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Fetch invoice with employer data
    const { data: invoice, error: invoiceError } = await client
      .from('invoices')
      .select(`
        *,
        employer:employers(*),
        appointment_charges(*)
      `)
      .eq('id', invoiceId)
      .single();

    if (invoiceError || !invoice) {
      return new Response(
        JSON.stringify({ error: 'Invoice not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    let userId = null;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await client.auth.getUser(token);
      if (!authError && user) {
        userId = user.id;
      }
    }

    // Log the PDF access
    await client.from('audit_logs').insert({
      user_id: userId,
      action: 'invoice_pdf_download',
      target: invoice.id,
      metadata: {
        employer_id: invoice.employer_id,
        month: invoice.month,
        amount: invoice.total_amount
      }
    });

    // Check if PDF already exists
    if (invoice.pdf_url) {
      // Redirect to existing PDF
      return Response.redirect(invoice.pdf_url, 302);
    }

    // Generate PDF using existing function
    const generateResponse = await fetch(`${supabaseUrl}/functions/v1/generate-invoice-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`
      },
      body: JSON.stringify({
        employerId: invoice.employer_id,
        month: invoice.month
      })
    });

    const generateData = await generateResponse.json();

    if (generateData.pdf_url) {
      // Redirect to generated PDF
      return Response.redirect(generateData.pdf_url, 302);
    } else {
      return new Response(
        JSON.stringify({ error: 'Failed to generate PDF' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});