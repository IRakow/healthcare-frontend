import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const openaiKey = Deno.env.get('PurityHealthOpenai')!
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { patient_id } = await req.json()
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch patient vitals
    const { data: vitals, error: vitalsError } = await supabase
      .from('vitals_summary')
      .select('*')
      .eq('patient_id', patient_id)
      .single()

    if (vitalsError || !vitals) {
      throw new Error('Unable to fetch patient vitals')
    }

    // Generate personalized health insights using OpenAI
    const prompt = `Based on the following health metrics, provide a personalized health summary with actionable insights:

Sleep: ${vitals.sleep_hours} hours average
Hydration: ${vitals.hydration_oz} oz daily
Workouts this week: ${vitals.workouts_this_week}
Protein intake: ${vitals.protein_grams}g daily
Risk flags: ${vitals.risk_flags}
Heart rate: ${vitals.heart_rate_avg || 'Not tracked'} bpm
Blood pressure: ${vitals.blood_pressure || 'Not tracked'}
Stress level: ${vitals.stress_level || 'Not tracked'}

Provide a brief, encouraging summary (4-6 short paragraphs) that:
1. Highlights positive trends
2. Identifies areas for improvement
3. Gives specific, actionable recommendations
4. Uses an empathetic, motivational tone
5. Includes relevant emojis sparingly

Format the response with line breaks between insights for readability.`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a friendly health coach providing personalized wellness insights. Be encouraging, specific, and actionable.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 400
      })
    })

    if (!response.ok) {
      throw new Error('Failed to generate health summary')
    }

    const aiResponse = await response.json()
    const summary = aiResponse.choices[0].message.content

    return new Response(
      JSON.stringify({ summary }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        summary: null 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})