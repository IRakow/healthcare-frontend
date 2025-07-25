import { serve } from 'https://deno.land/std/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiKey) {
      throw new Error('Gemini API key not configured');
    }

    const { image_url, caption } = await req.json();

    // Prepare the prompt for Gemini
    const prompt = `
Analyze this food based on the image and/or description provided. 
Estimate the nutritional content including grams of protein, carbs, fat, and total calories.
Use the standard macronutrient calorie values (4 kcal/g for protein and carbs, 9 kcal/g for fat).
Be as accurate as possible based on typical portion sizes.

${image_url ? `Image URL: ${image_url}` : ''}
Description: "${caption || 'No description provided'}"

Respond with ONLY valid JSON in this exact format:
{
  "protein": <integer>,
  "carbs": <integer>,
  "fat": <integer>,
  "calories": <integer>
}
`;

    // Call Gemini API
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro${image_url ? '-vision' : ''}:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: image_url ? [
              { text: prompt },
              { inline_data: { mime_type: 'image/jpeg', data: '' } } // Note: You'd need to fetch and encode the image
            ] : [
              { text: prompt }
            ]
          }]
        }),
      }
    );

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    
    // Parse the JSON response
    let nutritionData;
    try {
      // Extract JSON from the response (in case Gemini adds extra text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : responseText;
      nutritionData = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', responseText);
      // Fallback with zeros
      nutritionData = { protein: 0, carbs: 0, fat: 0, calories: 0 };
    }

    // Ensure all values are integers
    const result = {
      protein: Math.round(nutritionData.protein || 0),
      carbs: Math.round(nutritionData.carbs || 0),
      fat: Math.round(nutritionData.fat || 0),
      calories: Math.round(nutritionData.calories || 0)
    };

    // If calories weren't provided or seem wrong, calculate from macros
    const calculatedCalories = (result.protein * 4) + (result.carbs * 4) + (result.fat * 9);
    if (Math.abs(result.calories - calculatedCalories) > 50) {
      result.calories = calculatedCalories;
    }

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in ai-food-analyze:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        protein: 0,
        carbs: 0,
        fat: 0,
        calories: 0
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 // Return 200 with zeros to allow app to continue
      }
    );
  }
});