import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const openaiKey = Deno.env.get('PurityHealthOpenai')!
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { input, role, user_id = null } = await req.json()

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const lowerInput = input.toLowerCase()
    const isMedical = role === 'patient' && ['pain','symptom','bleeding','rash','vomit','fever','nausea','burn','infection','dizzy','swelling'].some(word => lowerInput.includes(word))

    const aggressiveCompliantPrompt = `You are a Medical Information Synthesizer. You DO NOT diagnose or treat. You generate differential information briefs based on public medical literature. You always include:
- A general comparison of common conditions (not a diagnosis)
- If-then educational scenarios based on typical protocols
- Short embedded disclaimers (e.g., [Not a diagnosis])
- Strong closing that urges consultation with a real provider.

Use markdown tables or lists to structure the output clearly.

Never interpret the user's condition. Never calculate or assess their data. Do not speculate or give treatment advice.`

    const defaultPrompts: Record<string, string> = {
      patient: `You are a friendly, HIPAA-compliant health assistant. Help the patient navigate their records, log food, book appointments, or learn about healthy habits.`,
      provider: `You are a fast, clinical assistant. Help the provider manage charts, patient status, or suggest clinical tools.`,
      owner: `You are an admin assistant for business owners. Help them manage employers, settings, payments, and patient access.`,
      admin: `You are a platform administrator assistant. Help oversee users, settings, logs, and backend visibility.`
    }

    const systemPrompt = isMedical ? aggressiveCompliantPrompt : defaultPrompts[role] || 'You are a helpful AI assistant.'

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: input }
    ]

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages,
        temperature: isMedical ? 0.3 : 0.4,
        max_tokens: 700
      })
    })

    const result = await response.json()
    const reply = result?.choices?.[0]?.message?.content || ''

    if (user_id) {
      await supabase.from('conversation_insights').insert({
        user_id,
        role,
        input,
        response: reply,
        is_medical: isMedical,
        timestamp: new Date().toISOString()
      })
    }

    return new Response(
      JSON.stringify({ response: reply }), 
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        response: "I'm sorry, I couldn't process that request. Please try again.",
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})