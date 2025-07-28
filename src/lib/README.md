# Library Structure

## `/lib/api/`
Contains all API-related functions that communicate with Supabase Edge Functions or the database.

- `fetchWeeklyMealPlan.ts` - Fetches and generates meal plans
- `analyzeMealPhoto.ts` - Analyzes meal photos using AI (via Edge Function)
- `streamToAI.ts` - Converts voice to text (via Edge Function)

## `/lib/ai/`
Legacy AI functions for backward compatibility. These now wrap the API functions.

⚠️ **Deprecated**: Use `/lib/api/` functions directly for new code.

## `/lib/voice/`
Legacy voice functions for backward compatibility. These now wrap the API functions.

⚠️ **Deprecated**: Use `/lib/api/` functions directly for new code.

## `/lib/supabase.ts`
Main Supabase client configuration using Vite environment variables.

## Important Notes

1. **Environment Variables**: This project uses Vite, so all client-side environment variables must be prefixed with `VITE_`
   - ✅ `import.meta.env.VITE_SUPABASE_URL`
   - ❌ `process.env.NEXT_PUBLIC_SUPABASE_URL`

2. **API Keys**: Sensitive API keys (OpenAI, Deepgram, etc.) should NEVER be exposed in client code
   - Store them as Supabase Edge Function secrets
   - Access them only within Edge Functions

3. **Edge Functions**: All AI operations should go through Supabase Edge Functions:
   - `/supabase/functions/analyze-meal-photo` - OpenAI Vision API
   - `/supabase/functions/voice-to-text` - Deepgram API
   - `/supabase/functions/generate-meal-plan` - OpenAI GPT-4