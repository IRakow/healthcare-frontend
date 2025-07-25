import { serve } from 'https://deno.land/std/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js';

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const geminiKey = Deno.env.get('PurityHealthGemini')!;

async function fetchGeminiSOAP(transcript: string): Promise<string> {
  const prompt = `
Generate a SOAP note from this medical transcript. Format it clearly with:
S: Subjective
O: Objective
A: Assessment
P: Plan

Transcript:
${transcript}
`;

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  const json = await res.json();
  return json.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

serve(async () => {
  const { data: appts } = await supabase
    .from('appointments')
    .select('*')
    .eq('status', 'complete')
    .eq('transcript_summarized', false);

  if (!appts?.length) return new Response('✅ No completed visits needing SOAP');

  for (const appt of appts) {
    const { data: segments } = await supabase
      .from('appointment_transcripts')
      .select('text')
      .eq('appointment_id', appt.id)
      .order('created_at');

    const fullTranscript = segments.map(s => s.text).join(' ');
    
    let soapNote = '';
    let success = true;
    
    try {
      soapNote = await fetchGeminiSOAP(fullTranscript);
    } catch (error) {
      console.error('Error generating SOAP note:', error);
      success = false;
    }

    // Get provider info for the appointment
    const { data: appointment } = await supabase
      .from('appointments')
      .select('*, provider:users!appointments_provider_id_fkey(id, role)')
      .eq('id', appt.id)
      .single();

    // Log AI interaction
    await supabase.from('ai_logs').insert({
      user_id: appointment?.provider?.id || appt.provider_id,
      role: appointment?.provider?.role || 'provider',
      model: 'Gemini',
      voice_used: null,
      action: 'Generate SOAP Note',
      input: fullTranscript,
      output: soapNote,
      success
    });

    if (success && soapNote) {
      await supabase.from('patient_timeline_events').insert({
        patient_id: appt.patient_id,
        type: 'visit',
        label: 'SOAP Note (AI Generated)',
        data: { soap: soapNote, appointment_id: appt.id }
      });

      await supabase.from('appointments').update({ transcript_summarized: true }).eq('id', appt.id);
    }
  }

  return new Response('✅ SOAP notes generated');
});