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

    if (!symptoms) {
      throw new Error('No symptoms provided');
    }

    const prompt = `You are a clinical educator. The user entered: "${symptoms}". 
Explain the top 3 possible differential diagnoses with if-then reasoning, without interpreting the patient data directly. Use educational tone and include micro-disclaimers.

Format your response as follows:
1. Start with a disclaimer about this being educational information only
2. List each differential diagnosis with:
   - Condition name
   - If-then reasoning (e.g., "If a patient presents with X, then Y might be considered because...")
   - Key distinguishing features
   - When to seek medical attention

3. End with a reminder to consult healthcare professionals for actual diagnosis

Keep the language accessible but medically accurate.`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        contents: [{ 
          parts: [{ text: prompt }] 
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        }
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Gemini API error: ${res.status} - ${error}`);
    }

    const json = await res.json();
    const brief = json.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to generate response';

    return new Response(
      JSON.stringify({ 
        success: true,
        brief,
        symptoms: symptoms
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