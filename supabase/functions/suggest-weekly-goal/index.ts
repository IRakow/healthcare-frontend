import { serve } from 'https://deno.land/std/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js';

const geminiKey = Deno.env.get('PurityHealthGemini')!;
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

serve(async (req) => {
  const { patientId } = await req.json();

  // Get last 7 days of data
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [foodLogs, sleepLogs, wearableLogs] = await Promise.all([
    supabase
      .from('food_logs')
      .select('*')
      .eq('patient_id', patientId)
      .gte('created_at', weekAgo.toISOString()),
    
    supabase
      .from('wearable_logs')
      .select('*')
      .eq('patient_id', patientId)
      .gte('date', weekAgo.toISOString()),
    
    supabase
      .from('weekly_goals')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })
      .limit(3)
  ]);

  const prompt = `
Based on the last 7 days of food, sleep, and wearables data, suggest 1 realistic lifestyle improvement goal for this week. 

Food logs: ${JSON.stringify(foodLogs.data)}
Wearable/Sleep data: ${JSON.stringify(wearableLogs.data)}
Previous goals: ${JSON.stringify(wearableLogs.data)}

Format your response as JSON:
{
  "focus_area": "hydration|protein|sleep|steps|exercise|meditation|calories|carbs|fiber",
  "goal_description": "Clear, motivating description",
  "target_value": number,
  "unit": "oz|g|hrs|steps|min|kcal"
}

Focus on one specific, achievable improvement based on the data patterns.
`;

  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  const json = await res.json();
  const aiResponse = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  try {
    const goal = JSON.parse(aiResponse);
    
    // Log AI interaction
    await supabase.from('ai_logs').insert({
      user_id: patientId,
      role: 'system',
      model: 'Gemini',
      action: 'Suggest Weekly Goal',
      input: prompt,
      output: aiResponse,
      success: true
    });

    return new Response(JSON.stringify(goal), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Failed to generate goal suggestion' 
    }), { status: 500 });
  }
});