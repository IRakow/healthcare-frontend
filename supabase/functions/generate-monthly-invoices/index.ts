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

    // Get current month or use provided month
    const { month: providedMonth } = await req.json().catch(() => ({ month: null }));
    const month = providedMonth || new Date().toISOString().slice(0, 7); // '2025-07'

    // Get all active employers
    const { data: employers, error: employersError } = await client
      .from('employers')
      .select('*')
      .not('billing_plan', 'is', null);

    if (employersError) throw employersError;

    const results = {
      month,
      processed: 0,
      skipped: 0,
      errors: [],
      invoices: []
    };

    for (const employer of employers || []) {
      try {
        // Check if invoice already exists for this month
        const { data: existing } = await client
          .from('invoices')
          .select('id')
          .eq('employer_id', employer.id)
          .eq('month', month)
          .maybeSingle();

        if (existing) {
          results.skipped++;
          continue;
        }

        let total_amount = 0;
        let memberTotal = 0;
        let depTotal = 0;

        if (employer.billing_plan === 'per_member' && employer.monthly_fee_per_member) {
          // Count active members for per_member billing
          const { data: members } = await client
            .from('members')
            .select('id')
            .eq('employer_id', employer.id)
            .eq('active', true);

          memberTotal = employer.monthly_fee_per_member * (members?.length || 0);

          // Calculate family member fees
          const { data: holders } = await client
            .from('users')
            .select('id')
            .eq('employer_id', employer.id);

          const holderIds = holders?.map((h) => h.id) || [];

          if (holderIds.length > 0) {
            const { data: dependents } = await client
              .from('family_members')
              .select('*')
              .in('account_holder_id', holderIds);

            const totalDependents = dependents?.length || 0;
            depTotal = (employer.family_member_fee || 0) * totalDependents;
          }

          total_amount = memberTotal + depTotal;
        } else if (employer.billing_plan === 'flat_rate') {
          // For flat rate, extract from custom_invoice_note or use a default
          // This is a simplified approach - in production, you'd have a separate field
          const flatRateMatch = employer.custom_invoice_note?.match(/\$([0-9,]+)/);
          if (flatRateMatch) {
            total_amount = parseInt(flatRateMatch[1].replace(/,/g, ''));
          }
        }

        // Create the invoice
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

        results.processed++;
        results.invoices.push({
          employer: employer.name,
          amount: total_amount,
          invoice_id: newInvoice.id
        });

      } catch (error) {
        results.errors.push({
          employer: employer.name,
          error: error.message
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Invoices generated for ${month}`,
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