import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId, preferences } = await req.json()

    if (!userId) {
      throw new Error('User ID is required')
    }

    const { goal, diet, allergies } = preferences || {}

    // Initialize OpenAI
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // Generate meal plan with OpenAI
    const prompt = `Generate a 7-day meal plan with the following requirements:
    - Goal: ${goal || 'maintain weight'}
    - Diet style: ${diet || 'Mediterranean'}
    - Allergies to avoid: ${allergies || 'none'}
    
    For each day, provide breakfast, lunch, and dinner with:
    - Title
    - Estimated calories
    - Protein in grams
    - List of main ingredients (3-4 items)
    
    Format the response as valid JSON with this structure:
    {
      "mealPlan": [
        {
          "day": "Monday",
          "breakfast": { "title": "", "calories": 0, "protein": 0, "ingredients": [] },
          "lunch": { "title": "", "calories": 0, "protein": 0, "ingredients": [] },
          "dinner": { "title": "", "calories": 0, "protein": 0, "ingredients": [] }
        }
      ]
    }`

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a professional nutritionist creating healthy, balanced meal plans.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    })

    const aiData = await openaiResponse.json()
    const mealPlanText = aiData.choices[0]?.message?.content || '{}'
    
    let mealPlanData
    try {
      mealPlanData = JSON.parse(mealPlanText)
    } catch {
      // Fallback meal plan if parsing fails
      mealPlanData = {
        mealPlan: weekDays.map(day => ({
          day,
          breakfast: {
            title: 'Greek Yogurt Parfait',
            calories: 300,
            protein: 20,
            ingredients: ['Greek yogurt', 'Berries', 'Granola', 'Honey']
          },
          lunch: {
            title: 'Mediterranean Quinoa Bowl',
            calories: 520,
            protein: 22,
            ingredients: ['Quinoa', 'Chickpeas', 'Feta', 'Vegetables']
          },
          dinner: {
            title: 'Grilled Salmon with Greens',
            calories: 480,
            protein: 35,
            ingredients: ['Salmon', 'Spinach', 'Sweet potato', 'Olive oil']
          }
        }))
      }
    }

    // Initialize Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Store the meal plan in the database
    const { data: storedPlans, error } = await supabase
      .from('weekly_meal_plans')
      .upsert(
        mealPlanData.mealPlan.map((plan: any) => ({
          user_id: userId,
          ...plan,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })),
        { onConflict: 'user_id,day' }
      )
      .select()

    if (error) throw error

    return new Response(
      JSON.stringify({ mealPlan: storedPlans || mealPlanData.mealPlan }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})