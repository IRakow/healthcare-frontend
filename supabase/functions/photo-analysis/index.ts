import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { image } = await req.json()
    
    if (!image) {
      return new Response(
        JSON.stringify({ error: 'No image provided' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get the authorization header to verify the user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      )
    }

    // Call OpenAI Vision API (or alternative AI service)
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'system',
            content: `You are a nutritionist AI that analyzes food photos. 
            Identify all foods in the image and provide detailed nutritional estimates.
            Return a JSON object with this structure:
            {
              "foods": [
                {
                  "name": "food item name",
                  "quantity": "estimated amount",
                  "calories": number,
                  "protein": number (in grams),
                  "carbs": number (in grams),
                  "fat": number (in grams),
                  "fiber": number (in grams)
                }
              ],
              "total": {
                "calories": number,
                "protein": number,
                "carbs": number,
                "fat": number,
                "fiber": number
              },
              "mealType": "breakfast/lunch/dinner/snack",
              "healthScore": number (1-10),
              "suggestions": ["suggestion 1", "suggestion 2"]
            }`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this meal photo and provide nutritional information'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${image}`
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
      }),
    })

    const aiData = await openAIResponse.json()
    
    if (!openAIResponse.ok) {
      console.error('OpenAI API error:', aiData)
      return new Response(
        JSON.stringify({ error: 'Failed to analyze image' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    // Parse the AI response
    let nutritionData
    try {
      nutritionData = JSON.parse(aiData.choices[0].message.content)
    } catch (e) {
      console.error('Failed to parse AI response:', e)
      return new Response(
        JSON.stringify({ error: 'Invalid response from AI' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    // Get user ID from auth token
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid user' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      )
    }

    // Save to database
    const { data: foodLog, error: dbError } = await supabase
      .from('food_log')
      .insert({
        patient_id: user.id,
        date: new Date().toISOString(),
        meal_type: nutritionData.mealType,
        food_items: nutritionData.foods.map(f => f.name).join(', '),
        total_calories: nutritionData.total.calories,
        total_protein: nutritionData.total.protein,
        total_carbs: nutritionData.total.carbs,
        total_fat: nutritionData.total.fat,
        total_fiber: nutritionData.total.fiber,
        health_score: nutritionData.healthScore,
        photo_analysis: nutritionData,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return new Response(
        JSON.stringify({ error: 'Failed to save food log' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    // Return the analysis results
    return new Response(
      JSON.stringify({
        success: true,
        analysis: nutritionData,
        foodLogId: foodLog.id
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})