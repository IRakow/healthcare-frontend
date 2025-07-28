import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CommandRequest {
  input: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { input }: CommandRequest = await req.json()

    // In production, this would call Google Gemini API
    // For now, we'll use pattern matching to determine intent
    const intent = detectIntent(input)
    const entities = extractEntities(input, intent)

    // Generate appropriate response based on intent
    let response = ''
    switch (intent) {
      case 'log_food':
        response = `I'll log "${entities.food_item}" for you.`
        break
      case 'log_medication':
        response = `Adding ${entities.medication_name} ${entities.dosage} to your medications.`
        break
      case 'book_appointment':
        response = `Booking appointment with ${entities.provider_name}.`
        break
      case 'check_vitals':
        response = 'Let me check your vitals for you.'
        break
      default:
        response = generateGeneralResponse(input)
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        intent,
        entities,
        response
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

function detectIntent(input: string): string {
  const lowered = input.toLowerCase()
  
  if (lowered.includes('log') && (lowered.includes('food') || lowered.includes('ate') || lowered.includes('meal'))) {
    return 'log_food'
  }
  
  if (lowered.includes('add') && (lowered.includes('medication') || lowered.includes('medicine') || lowered.includes('pill'))) {
    return 'log_medication'
  }
  
  if (lowered.includes('book') && (lowered.includes('appointment') || lowered.includes('doctor') || lowered.includes('visit'))) {
    return 'book_appointment'
  }
  
  if (lowered.includes('vitals') || lowered.includes('health') || lowered.includes('stats')) {
    return 'check_vitals'
  }
  
  return 'general_query'
}

function extractEntities(input: string, intent: string): any {
  // Simple entity extraction - in production, use NLP
  const entities: any = {}
  
  switch (intent) {
    case 'log_food':
      // Extract food item (everything after "log" or "ate")
      const foodMatch = input.match(/(?:log|ate|had)\s+(.+)/i)
      entities.food_item = foodMatch ? foodMatch[1] : input
      
      // Extract calories if mentioned
      const calorieMatch = input.match(/(\d+)\s*(?:cal|calories)/i)
      entities.calories = calorieMatch ? parseInt(calorieMatch[1]) : null
      break
      
    case 'log_medication':
      // Extract medication name and dosage
      const medMatch = input.match(/add\s+(\w+)\s+(\d+\s*mg)/i)
      if (medMatch) {
        entities.medication_name = medMatch[1]
        entities.dosage = medMatch[2]
      }
      break
      
    case 'book_appointment':
      // Extract provider name
      const providerMatch = input.match(/(?:with|see)\s+(?:dr\.?\s+)?(\w+)/i)
      entities.provider_name = providerMatch ? `Dr. ${providerMatch[1]}` : 'Dr. Smith'
      
      // Extract time if mentioned
      const timeMatch = input.match(/at\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i)
      entities.time = timeMatch ? timeMatch[1] : 'next available'
      break
  }
  
  return entities
}

function generateGeneralResponse(input: string): string {
  const lowered = input.toLowerCase()
  
  if (lowered.includes('hello') || lowered.includes('hi')) {
    return "Hello! I'm your health assistant. How can I help you today?"
  }
  
  if (lowered.includes('thank')) {
    return "You're welcome! Is there anything else I can help with?"
  }
  
  if (lowered.includes('what') && lowered.includes('eat')) {
    return "Based on your health goals, I recommend focusing on lean proteins, vegetables, and whole grains. Would you like specific meal suggestions?"
  }
  
  return "I understand you're asking about: " + input + ". How can I help you with this?"
}