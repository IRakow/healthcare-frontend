import { serve } from 'https://deno.land/std/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js';

const geminiKey = Deno.env.get('GEMINI_API_KEY')!;
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

serve(async (req) => {
  const { patientId } = await req.json();
  
  // Get patient data
  const { data: patient } = await supabase
    .from('users')
    .select('*')
    .eq('id', patientId)
    .single();
    
  const { data: vitals } = await supabase
    .from('vitals')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })
    .limit(10);
    
  const { data: medications } = await supabase
    .from('medications')
    .select('*')
    .eq('patient_id', patientId);
    
  const { data: appointments } = await supabase
    .from('appointments')
    .select('*')
    .eq('patient_id', patientId)
    .order('date', { ascending: false })
    .limit(5);
    
  const { data: labResults } = await supabase
    .from('lab_results')
    .select('*')
    .eq('patient_id', patientId)
    .order('date', { ascending: false })
    .limit(3);

  const patientData = {
    demographics: patient,
    recent_vitals: vitals,
    medications,
    appointments,
    lab_results: labResults
  };

  const prompt = `
You are a medical risk assessment AI. Analyze this patient data and identify any health risks or concerns.

Patient Data:
${JSON.stringify(patientData, null, 2)}

Provide a structured risk assessment focusing on:
1. Vital sign abnormalities
2. Medication compliance issues
3. Overdue appointments or follow-ups
4. Lab result concerns
5. Chronic condition management

Format the response as a JSON array of risks, each with:
- reason: Brief description of the risk
- severity: low, medium, or high
- category: vitals, medications, appointments, labs, or chronic
`;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });

    const json = await res.json();
    const aiResponse = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Parse AI response
    let risks = [];
    try {
      // Extract JSON from response
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        risks = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('Error parsing AI response:', e);
    }

    // Log AI interaction
    await supabase.from('ai_logs').insert({
      user_id: patientId,
      role: 'system',
      model: 'Gemini',
      voice_used: null,
      action: 'Risk Detection',
      input: JSON.stringify(patientData),
      output: aiResponse,
      success: risks.length > 0
    });

    // Create risk flags for high severity risks
    for (const risk of risks) {
      if (risk.severity === 'high') {
        await supabase.from('patient_risk_flags').insert({
          patient_id: patientId,
          reason: risk.reason,
          severity: risk.severity,
          flagged_by: 'AI System'
        });

        // Add to timeline
        await supabase.from('patient_timeline_events').insert({
          patient_id: patientId,
          type: 'alert',
          label: 'AI Risk Detection',
          data: risk
        });
      }
    }

    return new Response(JSON.stringify({ risks }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in risk detection:', error);
    
    // Log failed attempt
    await supabase.from('ai_logs').insert({
      user_id: patientId,
      role: 'system',
      model: 'Gemini',
      voice_used: null,
      action: 'Risk Detection',
      input: JSON.stringify(patientData),
      output: error.message,
      success: false
    });

    return new Response(JSON.stringify({ error: 'Risk detection failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});