import { serve } from 'https://deno.land/std/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js';

const geminiKey = Deno.env.get('GEMINI_API_KEY')!;
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

serve(async (req) => {
  const { file_url, type } = await req.json();

  try {
    // Fetch the actual image data from the URL
    const imageResponse = await fetch(file_url);
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));

    const prompt = `
You're an AI assistant trained in medical image analysis. 
Analyze this ${type} and provide clinically relevant observations.

Focus on:
- Visible skin conditions, rashes, or lesions
- Swelling or inflammation
- Color changes or discoloration  
- Symmetry or asymmetry
- Any notable patterns

Do not diagnose. Only describe what you observe in medical terms.
Suggest if medical consultation might be beneficial.
`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { 
              inline_data: { 
                mime_type: type === 'video' ? 'video/mp4' : 'image/jpeg', 
                data: base64Image 
              }
            }
          ]
        }]
      })
    });

    const json = await res.json();
    const summary = json.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to analyze the image.';

    // Log the AI analysis
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      
      if (user) {
        await supabase.from('ai_logs').insert({
          user_id: user.id,
          role: 'patient',
          model: 'Gemini 1.5 Flash',
          action: 'Analyze Medical Image',
          input: `${type} analysis request`,
          output: summary,
          success: true
        });
      }
    }

    return new Response(JSON.stringify({ summary }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error analyzing image:', error);
    return new Response(JSON.stringify({ 
      summary: 'Unable to analyze the image. Please try again.' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});