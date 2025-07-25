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
    const geminiKey = Deno.env.get('PurityHealthGemini')!;
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const client = createClient(supabaseUrl, serviceRoleKey);

    const { query, userId } = await req.json();

    const prompt = `
You are the "Medical Information Synthesizer" — not a diagnostic tool. Your role is to synthesize general medical information based on user-reported symptoms or questions.

⚠️ This is general medical information only. It is not a diagnosis or treatment plan. Always consult a licensed medical professional.

ALWAYS follow these rules:
- Never guess about the user's personal condition.
- Use structured bullet points, clinical comparisons, or differential explanations.
- Use "If... then..." logic whenever comparing possible conditions.
- Include embedded micro-disclaimers like (note: values vary person to person).
- Always end with: "Please consult a licensed healthcare provider immediately if you have any concern."

DO NOT include any empathetic or fluffy language. Be professional, clear, and instructive.

Patient input: "${query}"
`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });

    const json = await res.json();
    const reply = json.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to process request at this time.';

    // Log the AI interaction if userId is provided
    if (userId) {
      await client.from('ai_logs').insert({
        user_id: userId,
        input: query,
        output: reply,
      });

      await client.from('patient_timeline_events').insert({
        patient_id: userId,
        type: 'ai',
        label: 'Medical Info Synthesis',
        data: { input: query, output: reply, model: 'gemini-pro' },
      });
    }

    return new Response(
      JSON.stringify({ reply }),
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
        error: error.message,
        reply: 'An error occurred. Please try again later.' 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        },
        status: 500
      }
    );
  }
});