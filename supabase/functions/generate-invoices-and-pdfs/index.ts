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
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const client = createClient(supabaseUrl, serviceRoleKey);

    // Get current month or use provided month
    const { month: providedMonth } = await req.json().catch(() => ({ month: null }));
    const month = providedMonth || new Date().toISOString().slice(0, 7);

    const results = {
      month,
      invoices: {
        created: 0,
        skipped: 0,
        errors: []
      },
      pdfs: {
        generated: 0,
        failed: 0,
        errors: []
      }
    };

    // Step 1: Generate invoices
    console.log('Step 1: Generating invoices...');
    
    const { data: employers, error: employersError } = await client
      .from('employers')
      .select('*')
      .not('billing_plan', 'is', null);

    if (employersError) throw employersError;

    for (const employer of employers || []) {
      try {
        // Check if invoice already exists
        const { data: existing } = await client
          .from('invoices')
          .select('id')
          .eq('employer_id', employer.id)
          .eq('month', month)
          .maybeSingle();

        if (existing) {
          results.invoices.skipped++;
          continue;
        }

        let total_amount = 0;

        if (employer.billing_plan === 'per_member' && employer.monthly_fee_per_member) {
          const { count } = await client
            .from('members')
            .select('*', { count: 'exact', head: true })
            .eq('employer_id', employer.id)
            .eq('active', true);

          total_amount = employer.monthly_fee_per_member * (count || 0);
        } else if (employer.billing_plan === 'flat_rate') {
          const flatRateMatch = employer.custom_invoice_note?.match(/\$([0-9,]+)/);
          if (flatRateMatch) {
            total_amount = parseInt(flatRateMatch[1].replace(/,/g, ''));
          }
        }

        const { data: newInvoice, error: insertError } = await client
          .from('invoices')
          .insert({
            employer_id: employer.id,
            month,
            total_amount,
            status: 'Pending',
          })
          .select()
          .single();

        if (insertError) throw insertError;
        results.invoices.created++;

      } catch (error) {
        results.invoices.errors.push({
          employer: employer.name,
          error: error.message
        });
      }
    }

    // Step 2: Generate PDFs for all invoices without PDFs
    console.log('Step 2: Generating PDFs...');
    
    const { data: invoicesNeedingPdfs, error: invoicesError } = await client
      .from('invoices')
      .select('*, employers(*)')
      .eq('month', month)
      .is('pdf_url', null);

    if (invoicesError) throw invoicesError;

    // Process PDFs in batches
    const batchSize = 3;
    for (let i = 0; i < (invoicesNeedingPdfs || []).length; i += batchSize) {
      const batch = invoicesNeedingPdfs.slice(i, i + batchSize);
      
      const pdfPromises = batch.map(async (invoice) => {
        try {
          // Call the PDF generation function
          const pdfResponse = await fetch(`${supabaseUrl}/functions/v1/generate-invoice-pdf`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${anonKey}`,
            },
            body: JSON.stringify({
              employerId: invoice.employer_id,
              month: invoice.month
            }),
          });

          if (!pdfResponse.ok) {
            const error = await pdfResponse.json();
            throw new Error(error.error || 'PDF generation failed');
          }

          const pdfResult = await pdfResponse.json();
          results.pdfs.generated++;
          
          return {
            employer: invoice.employers.name,
            status: 'success',
            pdf_url: pdfResult.pdf_url
          };
        } catch (error) {
          results.pdfs.failed++;
          results.pdfs.errors.push({
            employer: invoice.employers?.name || 'Unknown',
            error: error.message
          });
          return {
            employer: invoice.employers?.name || 'Unknown',
            status: 'failed',
            error: error.message
          };
        }
      });

      await Promise.all(pdfPromises);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Monthly invoice and PDF generation complete for ${month}`,
        results
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        },
        status: 400
      }
    );
  }
});