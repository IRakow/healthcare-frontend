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
    const geminiKey = Deno.env.get('PurityHealthGemini') || Deno.env.get('GEMINI_API_KEY');
    
    if (!geminiKey) {
      throw new Error('Gemini API key not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const client = createClient(supabaseUrl, serviceRoleKey);

    const { month, employerId, rawData } = await req.json();

    let dataToSummarize = rawData;

    // If no raw data provided, fetch from database
    if (!dataToSummarize) {
      if (month) {
        // Fetch monthly billing data
        const { data: invoices } = await client
          .from('invoice_summaries')
          .select('*')
          .eq('month', month);

        const { data: monthlyStats } = await client
          .from('invoices')
          .select('status, total_amount')
          .eq('month', month);

        const totalRevenue = monthlyStats?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0;
        const paidCount = monthlyStats?.filter(inv => inv.status === 'Paid').length || 0;
        const pendingCount = monthlyStats?.filter(inv => inv.status === 'Pending').length || 0;

        dataToSummarize = `
          Monthly Billing Summary for ${month}:
          - Total Invoices: ${invoices?.length || 0}
          - Total Revenue: $${totalRevenue.toLocaleString()}
          - Paid Invoices: ${paidCount}
          - Pending Invoices: ${pendingCount}
          
          Top Employers by Amount:
          ${invoices?.slice(0, 5).map(inv => 
            `${inv.employer_name}: $${inv.total_amount.toLocaleString()} (${inv.status})`
          ).join('\n')}
        `;
      } else if (employerId) {
        // Fetch employer-specific billing data
        const { data: employer } = await client
          .from('employers')
          .select('*')
          .eq('id', employerId)
          .single();

        const { data: invoices } = await client
          .from('invoices')
          .select('*')
          .eq('employer_id', employerId)
          .order('month', { ascending: false })
          .limit(12);

        const totalBilled = invoices?.reduce((sum, inv) => sum + (inv.total_amount || 0), 0) || 0;
        const avgMonthly = invoices?.length ? totalBilled / invoices.length : 0;

        dataToSummarize = `
          Billing History for ${employer?.name}:
          - Billing Plan: ${employer?.billing_plan}
          - Total Billed (12 months): $${totalBilled.toLocaleString()}
          - Average Monthly: $${avgMonthly.toLocaleString()}
          - Custom Note: ${employer?.custom_invoice_note || 'None'}
          
          Recent Invoices:
          ${invoices?.slice(0, 6).map(inv => 
            `${inv.month}: $${inv.total_amount.toLocaleString()} (${inv.status})`
          ).join('\n')}
        `;
      }
    }

    // Call Gemini API for summary
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are a billing analyst. Provide a concise, professional summary of the following billing data. Include key insights, trends, and any notable observations. Format the response in clear paragraphs with bullet points for key metrics:\n\n${dataToSummarize}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        }
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Gemini API error: ${res.status} - ${error}`);
    }

    const json = await res.json();
    const summary = json.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to generate summary';

    return new Response(
      JSON.stringify({
        success: true,
        summary,
        data_source: rawData ? 'provided' : employerId ? 'employer' : 'monthly',
        parameters: { month, employerId }
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