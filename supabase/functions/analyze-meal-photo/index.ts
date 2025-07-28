import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { base64Image, userId } = await req.json()

    if (!base64Image) {
      throw new Error('No image provided')
    }

    // Initialize OpenAI
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Analyze image with OpenAI Vision
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this meal photo and provide: 1) Food items identified 2) Estimated calories 3) Estimated protein (g) 4) Estimated carbs (g) 5) Estimated fats (g). Format as JSON.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: base64Image
                }
              }
            ]
          }
        ],
        max_tokens: 300
      })
    })

    const visionData = await openaiResponse.json()
    const analysisText = visionData.choices[0]?.message?.content || '{}'
    
    let analysis
    try {
      analysis = JSON.parse(analysisText)
    } catch {
      // Fallback if response isn't valid JSON
      analysis = {
        items: ['Unable to parse food items'],
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        raw_response: analysisText
      }
    }

    // Store in database if userId provided
    if (userId) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      await supabase.from('food_logs').insert({
        user_id: userId,
        image_analysis: analysis,
        created_at: new Date().toISOString()
      })
    }

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})