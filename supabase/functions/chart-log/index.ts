import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { type, content, timestamp, patientId, appointmentId } = await req.json()

    // Validate required fields
    if (!type || !content || !timestamp) {
      throw new Error('Missing required fields: type, content, timestamp')
    }

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Create Supabase client with user's token
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Get provider ID from the user
    const { data: provider, error: providerError } = await supabase
      .from('providers')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (providerError || !provider) {
      throw new Error('Provider not found')
    }

    const providerId = provider.id

    // Determine which table to use based on type
    if (type === 'soap_summary' || type === 'soap_note') {
      // Store in soap_notes table
      const { data, error } = await supabase
        .from('soap_notes')
        .insert({
          provider_id: providerId,
          patient_id: patientId,
          appointment_id: appointmentId,
          subjective: extractSection(content, 'S:'),
          objective: extractSection(content, 'O:'),
          assessment: extractSection(content, 'A:'),
          plan: extractSection(content, 'P:'),
          full_note: content,
          created_at: timestamp
        })
        .select()
        .single()

      if (error) throw error

      // Also add to patient timeline
      await supabase
        .from('patient_timeline')
        .insert({
          patient_id: patientId,
          type: 'clinical_note',
          title: 'SOAP Note Created',
          content: `Clinical note added by Dr. ${user.user_metadata?.full_name || 'Provider'}`,
          timestamp,
          importance: 'medium',
          metadata: {
            soap_note_id: data.id,
            provider_id: providerId
          }
        })

      return new Response(
        JSON.stringify({ 
          success: true,
          data,
          message: 'SOAP note logged successfully'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    } else {
      // Store in patient_timeline table for other types
      const { data, error } = await supabase
        .from('patient_timeline')
        .insert({
          patient_id: patientId,
          type: type,
          title: formatTitle(type),
          content,
          timestamp,
          importance: determineImportance(type),
          metadata: {
            provider_id: providerId,
            appointment_id: appointmentId
          }
        })
        .select()
        .single()

      if (error) throw error

      return new Response(
        JSON.stringify({ 
          success: true,
          data,
          message: 'Chart log entry created successfully'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }
  } catch (error) {
    console.error('Error in chart-log function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

// Helper function to extract SOAP sections
function extractSection(content: string, marker: string): string {
  const regex = new RegExp(`${marker}\\s*([\\s\\S]*?)(?=(S:|O:|A:|P:|$))`, 'i')
  const match = content.match(regex)
  return match ? match[1].trim() : ''
}

// Helper function to format title based on type
function formatTitle(type: string): string {
  const titles: Record<string, string> = {
    'soap_summary': 'SOAP Note Summary',
    'vitals_recorded': 'Vitals Recorded',
    'medication_prescribed': 'Medication Prescribed',
    'lab_ordered': 'Lab Test Ordered',
    'referral_made': 'Referral Made',
    'procedure_performed': 'Procedure Performed',
    'diagnosis_added': 'Diagnosis Added',
    'followup_scheduled': 'Follow-up Scheduled'
  }
  return titles[type] || type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

// Helper function to determine importance based on type
function determineImportance(type: string): 'low' | 'medium' | 'high' {
  const highImportance = ['diagnosis_added', 'procedure_performed', 'referral_made']
  const mediumImportance = ['soap_summary', 'medication_prescribed', 'lab_ordered', 'vitals_recorded']
  
  if (highImportance.includes(type)) return 'high'
  if (mediumImportance.includes(type)) return 'medium'
  return 'low'
}