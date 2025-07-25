import { serve } from 'https://deno.land/std/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js';

const geminiKey = Deno.env.get('PurityHealthGemini')!;
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

serve(async (req) => {
  const { panel, results } = await req.json();
  
  // Get user from auth header
  const authHeader = req.headers.get('Authorization');
  let userId = null;
  let userRole = 'patient';
  
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    if (user) {
      userId = user.id;
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();
      userRole = userData?.role || 'patient';
    }
  }

  const prompt = `
You are a medical educator. Given this lab panel: "${panel}", explain each result clearly and simply. 
Use friendly, accurate, and compliant language. Mention if each value is within normal range or not.

Respond in patient-friendly format.

Lab Data:
${JSON.stringify(results, null, 2)}
`;

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });

  const json = await res.json();
  const summary = json.candidates?.[0]?.content?.parts?.[0]?.text || 'Unable to summarize.';
  
  // Log AI interaction
  if (userId) {
    try {
      await supabase.from('ai_logs').insert({
        user_id: userId,
        role: userRole,
        model: 'Gemini',
        voice_used: null,
        action: 'Analyze Lab Results',
        input: JSON.stringify({ panel, results }),
        output: summary,
        success: !!summary && summary !== 'Unable to summarize.'
      });
    } catch (error) {
      console.error('Error logging AI interaction:', error);
    }
  }
  
  return new Response(JSON.stringify({ summary }));
});