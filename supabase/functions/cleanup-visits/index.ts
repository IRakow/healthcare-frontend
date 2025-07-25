import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Calculate cutoff time (configurable, defaults to 1 hour)
    const timeoutHours = parseFloat(Deno.env.get('CLEANUP_TIMEOUT_HOURS') || '1');
    const now = new Date();
    const cutoff = new Date(now.getTime() - 1000 * 60 * 60 * timeoutHours);

    // Get all in-progress appointments
    const { data: appointments, error: fetchError } = await supabase
      .from('appointments')
      .select('*')
      .eq('status', 'in_progress');

    if (fetchError) {
      throw new Error(`Failed to fetch appointments: ${fetchError.message}`);
    }

    // Filter expired visits
    const expired = (appointments || []).filter((appt) => {
      // Check if appointment started more than 1 hour ago
      const startTime = new Date(`${appt.date}T${appt.time}`);
      return startTime < cutoff;
    });

    let cleanedCount = 0;
    const errors: string[] = [];

    // Process each expired visit
    for (const visit of expired) {
      try {
        // Update appointment status
        const { error: updateError } = await supabase
          .from('appointments')
          .update({ status: 'complete' })
          .eq('id', visit.id);

        if (updateError) {
          errors.push(`Failed to update appointment ${visit.id}: ${updateError.message}`);
          continue;
        }

        // Create timeline event
        const { error: timelineError } = await supabase
          .from('patient_timeline_events')
          .insert({
            patient_id: visit.patient_id,
            type: 'visit',
            label: 'Auto-Completed Visit (Timed Out)',
            data: { 
              appointment_id: visit.id,
              auto_completed: true,
              completed_at: new Date().toISOString()
            }
          });

        if (timelineError) {
          errors.push(`Failed to create timeline event for ${visit.id}: ${timelineError.message}`);
          continue;
        }

        cleanedCount++;
      } catch (error) {
        errors.push(`Error processing visit ${visit.id}: ${error.message}`);
      }
    }

    // Prepare response
    const response = {
      success: true,
      message: `✅ Cleaned up ${cleanedCount} visits out of ${expired.length} expired`,
      totalInProgress: appointments?.length || 0,
      expiredCount: expired.length,
      cleanedCount,
      errors: errors.length > 0 ? errors : undefined
    };

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in cleanup-visits:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});