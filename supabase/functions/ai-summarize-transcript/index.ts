import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

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
    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiKey) {
      throw new Error('Gemini API key not configured');
    }

    const { transcript, appointmentId } = await req.json();
    
    if (!transcript) {
      throw new Error('No transcript provided');
    }

    // Prepare the prompt for medical visit summarization
    const prompt = `
You are a medical assistant helping to summarize a doctor-patient visit transcript.
Please provide a concise, professional summary of the following medical visit transcript.

Include the following sections if applicable:
1. Chief Complaint / Reason for Visit
2. Symptoms Discussed
3. Medical History Mentioned
4. Examination Notes
5. Diagnosis or Assessment
6. Treatment Plan / Recommendations
7. Follow-up Instructions

Keep the summary professional, factual, and in third person.
Do not include any personal health information beyond what's necessary for the medical record.

Transcript:
${transcript}

Please provide a clear, organized summary:`;

    // Call Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.3, // Lower temperature for more factual output
            maxOutputTokens: 1000,
          }
        }),
      }
    );

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    const summary = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to generate summary';

    // Clean up the summary
    const cleanedSummary = summary
      .trim()
      .replace(/\*\*/g, '') // Remove markdown bold
      .replace(/\n{3,}/g, '\n\n'); // Reduce excessive line breaks

    return new Response(
      JSON.stringify({ 
        summary: cleanedSummary,
        appointmentId,
        wordCount: transcript.split(' ').length,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in ai-summarize-transcript:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        summary: 'Failed to generate summary' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 // Return 200 to allow app to continue
      }
    );
  }
});