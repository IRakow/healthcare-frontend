import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { transcript, appointmentId, providerId, patientId } = await req.json()

    if (!transcript) {
      throw new Error('No transcript provided')
    }

    // Initialize OpenAI
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Generate SOAP note with OpenAI
    const prompt = `You are a clinical documentation assistant. Given the transcript of a patient-provider encounter, generate a professional SOAP note.

Format the response as JSON with the following structure:
{
  "subjective": "Patient's complaints and history in their own words",
  "objective": "Clinical observations, vital signs, physical exam findings",
  "assessment": "Clinical impression and diagnosis",
  "plan": "Treatment plan including medications, labs, referrals, and follow-up",
  "icd10_codes": ["List of relevant ICD-10 codes"],
  "cpt_codes": ["List of relevant CPT codes for billing"]
}

Important guidelines:
- Be concise but thorough
- Use professional medical terminology
- Include specific details from the transcript
- Suggest appropriate ICD-10 and CPT codes based on the encounter

Transcript:
"""
${transcript}
"""

Generate the SOAP note:`;

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a medical documentation specialist creating accurate SOAP notes from patient encounters.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
      })
    })

    const aiData = await openaiResponse.json()
    const soapNoteText = aiData.choices[0]?.message?.content || '{}'
    
    let soapNote
    try {
      soapNote = JSON.parse(soapNoteText)
    } catch {
      // Fallback if response isn't valid JSON
      soapNote = {
        subjective: 'Unable to parse transcript',
        objective: 'No clinical data available',
        assessment: 'Incomplete documentation',
        plan: 'Review encounter recording',
        icd10_codes: [],
        cpt_codes: [],
        raw_response: soapNoteText
      }
    }

    // Initialize Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Save SOAP note to database
    const { data: savedNote, error } = await supabase
      .from('soap_notes')
      .insert({
        appointment_id: appointmentId,
        provider_id: providerId,
        patient_id: patientId,
        subjective: soapNote.subjective,
        objective: soapNote.objective,
        assessment: soapNote.assessment,
        plan: soapNote.plan,
        icd10_codes: soapNote.icd10_codes || [],
        cpt_codes: soapNote.cpt_codes || [],
        transcript: transcript,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    // Also save a summary for quick access
    await supabase
      .from('encounter_summaries')
      .insert({
        appointment_id: appointmentId,
        provider_id: providerId,
        patient_id: patientId,
        summary: `Chief Complaint: ${soapNote.subjective.split('.')[0]}. Assessment: ${soapNote.assessment.split('.')[0]}`,
        soap_note_id: savedNote.id,
        created_at: new Date().toISOString()
      })

    return new Response(
      JSON.stringify({ 
        soapNote: savedNote,
        summary: {
          subjective: soapNote.subjective,
          objective: soapNote.objective,
          assessment: soapNote.assessment,
          plan: soapNote.plan,
          codes: {
            icd10: soapNote.icd10_codes,
            cpt: soapNote.cpt_codes
          }
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})