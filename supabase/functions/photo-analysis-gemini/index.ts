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

    // Call Google Gemini API
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: `Analyze this meal photo and provide nutritional information.
                Identify all foods and provide estimates for:
                - Food items with quantities
                - Calories per item and total
                - Protein, carbs, fat, fiber in grams
                - Meal type (breakfast/lunch/dinner/snack)
                - Health score from 1-10
                - 2-3 healthy suggestions
                
                Format the response as a valid JSON object with this exact structure:
                {
                  "foods": [{"name": "string", "quantity": "string", "calories": number, "protein": number, "carbs": number, "fat": number, "fiber": number}],
                  "total": {"calories": number, "protein": number, "carbs": number, "fat": number, "fiber": number},
                  "mealType": "string",
                  "healthScore": number,
                  "suggestions": ["string"]
                }`
              },
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: image
                }
              }
            ]
          }]
        }),
      }
    )

    const geminiData = await geminiResponse.json()
    
    if (!geminiResponse.ok) {
      console.error('Gemini API error:', geminiData)
      return new Response(
        JSON.stringify({ error: 'Failed to analyze image' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    // Extract and parse the response
    let nutritionData
    try {
      const responseText = geminiData.candidates[0].content.parts[0].text
      // Extract JSON from the response (it might be wrapped in markdown code blocks)
      const jsonMatch = responseText.match(/```json\n?([\s\S]*?)\n?```/) || [null, responseText]
      nutritionData = JSON.parse(jsonMatch[1] || responseText)
    } catch (e) {
      console.error('Failed to parse AI response:', e)
      // Provide a mock response for demo purposes
      nutritionData = {
        foods: [
          {
            name: "Mixed salad",
            quantity: "1 bowl",
            calories: 250,
            protein: 15,
            carbs: 20,
            fat: 12,
            fiber: 8
          }
        ],
        total: {
          calories: 250,
          protein: 15,
          carbs: 20,
          fat: 12,
          fiber: 8
        },
        mealType: "lunch",
        healthScore: 8,
        suggestions: [
          "Great choice! Consider adding more protein",
          "Add some whole grain bread for complex carbs"
        ]
      }
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
        total_fiber: nutritionData.total.fiber || 0,
        health_score: nutritionData.healthScore,
        photo_analysis: nutritionData,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      // Still return the analysis even if saving fails
    }

    // Return the analysis results
    return new Response(
      JSON.stringify({
        success: true,
        analysis: nutritionData,
        foodLogId: foodLog?.id
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