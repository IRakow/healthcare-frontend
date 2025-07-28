import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CommandRequest {
  input: string
  role: string
  userId: string
  name: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { input, role, userId, name }: CommandRequest = await req.json()

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('PurityHealthOpenai')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an AI dispatcher for a healthcare platform. Given a user input, return ONLY a JSON object in the form:
            { "action": "string", "payload": {} }
            
            You are assisting a user named ${name || 'unknown'} with role ${role}.
            
            Available actions for patients:
            - logFood: { "description": "string", "calories": number }
            - addMedication: { "name": "string", "dosage": "string", "frequency": "string" }
            - bookAppointment: { "provider": "string", "date": "ISO date", "type": "virtual|in-person" }
            - askQuestion: { "topic": "string" }
            
            Available actions for admin/owner:
            - exportInvoices: {}
            - viewStats: { "metric": "string" }
            
            If the input is a general question, use askQuestion action.`
          },
          { role: 'user', content: input },
        ],
        temperature: 0,
        max_tokens: 150
      })
    })

    const openAIData = await openAIResponse.json()
    let parsed = {}
    let aiResponse = ''

    try {
      parsed = JSON.parse(openAIData.choices[0]?.message?.content || '{}')
    } catch (e) {
      console.error('Failed to parse OpenAI response:', e)
      parsed = { action: 'askQuestion', payload: { topic: input } }
    }

    // For questions, generate a helpful response
    if (parsed.action === 'askQuestion') {
      const questionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('PurityHealthOpenai')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are a helpful healthcare assistant. Answer the user's question about: ${parsed.payload.topic}. Keep responses concise and relevant to healthcare.`
            },
            { role: 'user', content: input },
          ],
          temperature: 0.7,
          max_tokens: 200
        })
      })

      const questionData = await questionResponse.json()
      aiResponse = questionData.choices[0]?.message?.content || 'I can help you with that.'
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        parsed,
        aiResponse,
        originalInput: input
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in ai-command-enhanced:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        parsed: { action: 'error', payload: {} }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})