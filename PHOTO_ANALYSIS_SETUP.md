# Photo Analysis Setup Guide

This guide explains how to set up the AI-powered meal photo analysis feature.

## Overview

The photo analysis feature allows users to:
1. Upload a photo of their meal
2. Get AI-powered nutritional analysis
3. Automatically log the meal to their food diary

## Backend Setup

### 1. Deploy the Supabase Edge Function

```bash
# Deploy the Gemini-based photo analysis function
supabase functions deploy photo-analysis-gemini
```

### 2. Set Environment Variables

In your Supabase dashboard, add these secrets:

```bash
# Google Gemini API (recommended - easier to set up)
GEMINI_API_KEY=your-gemini-api-key-here

# OR OpenAI API (alternative)
OPENAI_API_KEY=your-openai-api-key-here
```

### 3. Run Database Migration

Apply the migration to add photo analysis support:

```bash
supabase db push
```

This adds:
- `meal_type` column for categorizing meals
- `photo_analysis` JSONB column for storing AI results
- `health_score` column for meal health rating
- Indexes for better performance

## Getting API Keys

### Option 1: Google Gemini (Recommended)

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy the key and add it to Supabase secrets

### Option 2: OpenAI

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Enable GPT-4 Vision access
4. Copy the key and add it to Supabase secrets

## Frontend Integration

The frontend is already configured to use the photo analysis endpoint. The flow is:

1. User uploads photo in `/patient/nutrition` → Photo Entry tab
2. Image is converted to base64
3. Sent to Supabase Edge Function
4. AI analyzes the image and returns:
   - Detected foods with quantities
   - Nutritional breakdown (calories, protein, carbs, fat)
   - Health score (1-10)
   - Healthy eating suggestions
5. Results are saved to the database
6. UI displays the analysis

## Testing

1. Navigate to `/patient/nutrition`
2. Click on "Photo Entry" tab
3. Upload a photo of any meal
4. Click "Analyze Meal"
5. View the nutritional analysis

## API Response Format

```json
{
  "success": true,
  "analysis": {
    "foods": [
      {
        "name": "Grilled chicken breast",
        "quantity": "4 oz",
        "calories": 185,
        "protein": 35,
        "carbs": 0,
        "fat": 4,
        "fiber": 0
      }
    ],
    "total": {
      "calories": 450,
      "protein": 45,
      "carbs": 30,
      "fat": 15,
      "fiber": 8
    },
    "mealType": "lunch",
    "healthScore": 8,
    "suggestions": [
      "Great protein content!",
      "Consider adding more vegetables for fiber"
    ]
  },
  "foodLogId": "uuid-here"
}
```

## Troubleshooting

### "Failed to analyze image" error
- Check that the API key is correctly set in Supabase
- Verify the Edge Function is deployed
- Check Supabase function logs for details

### Image not uploading
- Ensure file size is under 5MB
- Check that the image format is supported (JPEG, PNG)
- Verify user is authenticated

### No nutritional data returned
- The AI might not recognize the food
- Try a clearer photo with better lighting
- Ensure the meal is clearly visible

## Cost Considerations

- **Google Gemini**: Free tier includes 60 requests/minute
- **OpenAI GPT-4 Vision**: ~$0.01-0.03 per image analysis
- Consider implementing rate limiting for production use

## Security

- All requests require authentication
- Images are not stored permanently (only analysis results)
- Row Level Security (RLS) ensures users can only see their own data
- API keys are stored securely in Supabase secrets