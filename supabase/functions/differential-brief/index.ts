import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

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

    const { symptoms } = await req.json();

    const prompt = `You are a clinical educator. The user entered: "${symptoms}". 
Explain the top 3 possible differential diagnoses with if-then reasoning, without interpreting the patient data directly. Use educational tone and include micro-disclaimers.`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });

    const json = await res.json();
    const brief = json.candidates?.[0]?.content?.parts?.[0]?.text;

    return new Response(
      JSON.stringify({ brief }),
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
        brief: 'Unable to generate differential diagnosis. Please try again.',
        error: error.message 
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