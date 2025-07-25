import { serve } from 'https://deno.land/std/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

serve(async (req) => {
  const { appointmentId } = await req.json();

  if (!appointmentId) {
    return new Response(JSON.stringify({ error: 'appointmentId required' }), { status: 400 });
  }

  try {
    // Update appointment status
    const { error: updateError } = await supabase
      .from('appointments')
      .update({ status: 'complete' })
      .eq('id', appointmentId);

    if (updateError) throw updateError;

    // Trigger SOAP generation via webhook
    const soapResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/generate-soap-notes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
        'Content-Type': 'application/json'
      }
    });

    if (!soapResponse.ok) {
      console.error('Failed to trigger SOAP generation');
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
});