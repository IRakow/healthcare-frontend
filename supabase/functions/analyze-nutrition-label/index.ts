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
    const { image, userId } = await req.json()

    if (!image) {
      throw new Error('No image provided')
    }

    // Initialize OpenAI
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Analyze nutrition label with OpenAI Vision
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
            role: 'system',
            content: 'You are a nutrition expert analyzing food labels. Extract accurate nutritional information and provide health insights.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this nutrition label and extract:
                1. Calories per serving
                2. Protein (g)
                3. Carbohydrates (g)
                4. Total fat (g)
                5. Fiber (g)
                6. Sugar (g)
                7. Sodium (mg)
                8. Serving size
                9. Key ingredients (first 5-10)
                10. Any health warnings based on the nutritional content
                11. Overall health score from 0-100
                
                Return as JSON with this structure:
                {
                  "calories": number,
                  "protein": number,
                  "carbs": number,
                  "fats": number,
                  "fiber": number,
                  "sugar": number,
                  "sodium": number,
                  "servingSize": string,
                  "ingredients": string[],
                  "warnings": string[],
                  "healthScore": number
                }`
              },
              {
                type: 'image_url',
                image_url: {
                  url: image
                }
              }
            ]
          }
        ],
        max_tokens: 500,
        temperature: 0.3
      })
    })

    const visionData = await openaiResponse.json()
    const analysisText = visionData.choices[0]?.message?.content || '{}'
    
    let nutritionData
    try {
      nutritionData = JSON.parse(analysisText)
    } catch {
      // Fallback if response isn't valid JSON
      nutritionData = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fats: 0,
        fiber: 0,
        sugar: 0,
        sodium: 0,
        servingSize: 'Unknown',
        ingredients: [],
        warnings: ['Unable to fully analyze nutrition label'],
        healthScore: 50,
        raw_response: analysisText
      }
    }

    // Calculate health score if not provided
    if (!nutritionData.healthScore) {
      let score = 100
      
      // Deduct points for high sugar
      if (nutritionData.sugar > 10) score -= Math.min(20, nutritionData.sugar - 10)
      
      // Deduct points for high sodium
      if (nutritionData.sodium > 400) score -= Math.min(15, (nutritionData.sodium - 400) / 100)
      
      // Deduct points for low fiber
      if (nutritionData.fiber < 3) score -= 10
      
      // Add points for protein
      if (nutritionData.protein > 10) score += Math.min(10, nutritionData.protein / 2)
      
      // Deduct points for high calories
      if (nutritionData.calories > 300) score -= Math.min(15, (nutritionData.calories - 300) / 50)
      
      nutritionData.healthScore = Math.max(0, Math.min(100, Math.round(score)))
    }

    // Generate warnings if not provided
    if (!nutritionData.warnings || nutritionData.warnings.length === 0) {
      nutritionData.warnings = []
      
      if (nutritionData.sugar > 15) {
        nutritionData.warnings.push('High sugar content')
      }
      if (nutritionData.sodium > 600) {
        nutritionData.warnings.push('High sodium content')
      }
      if (nutritionData.fiber < 2) {
        nutritionData.warnings.push('Low fiber content')
      }
      if (nutritionData.fats > 20) {
        nutritionData.warnings.push('High fat content')
      }
    }

    // Store in database if userId provided
    if (userId) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      await supabase.from('nutrition_scans').insert({
        user_id: userId,
        nutrition_data: nutritionData,
        health_score: nutritionData.healthScore,
        created_at: new Date().toISOString()
      })
    }

    return new Response(
      JSON.stringify({ nutritionData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})