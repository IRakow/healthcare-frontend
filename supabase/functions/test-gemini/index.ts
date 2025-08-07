import { serve } from 'https://deno.land/std/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    
    console.log('Testing Gemini API...');
    console.log('Key exists:', !!geminiKey);
    console.log('Key length:', geminiKey?.length || 0);
    console.log('Key starts with:', geminiKey?.substring(0, 5) + '...');
    
    if (!geminiKey) {
      throw new Error('GEMINI_API_KEY not found in environment variables');
    }

    // Test the API with a simple request
    const testPrompt = 'Say "Hello, meditation test successful!" in a calm voice.';
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: testPrompt }]
          }]
        }),
      }
    );

    const responseText = await response.text();
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse response:', responseText);
      throw new Error(`Invalid JSON response: ${responseText.substring(0, 500)}`);
    }

    if (!response.ok) {
      console.error('Gemini API error:', result);
      throw new Error(`Gemini API returned ${response.status}: ${result.error?.message || responseText.substring(0, 500)}`);
    }

    const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text;
    
    return new Response(
      JSON.stringify({
        success: true,
        keyExists: !!geminiKey,
        apiResponse: generatedText || 'No text generated',
        fullResponse: result
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('Test failed:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        details: error.toString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});