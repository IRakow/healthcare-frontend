# API Keys Reference

This document lists all the API keys used in the Supabase Edge Functions. These are already configured in your Supabase secrets.

## AI Services

### OpenAI
- **Key Name**: `PurityHealthOpenai`
- **Used For**: 
  - GPT-4 chat completions
  - GPT-4 Vision (photo analysis)
  - Advanced AI features

### Google Gemini
- **Key Name**: `PurityHealthGemini`
- **Used For**:
  - AI chat and analysis
  - Photo/media analysis
  - SOAP notes generation
  - Symptom checking
  - Medical summaries
  - Risk detection

## Communication Services

### Twilio
- **Account SID**: `TWILIO_ACCOUNT_SID`
- **Auth Token**: `TWILIO_AUTH_TOKEN`
- **Phone Number**: `TWILIO_PHONE_NUMBER`
- **Used For**:
  - SMS notifications
  - Appointment reminders
  - Two-way messaging

### ElevenLabs
- **Key Name**: `ELEVENLABS_API_KEY`
- **Used For**:
  - Text-to-speech
  - Voice synthesis
  - Meditation audio generation

### Deepgram
- **Key Name**: Not explicitly shown, but likely `DEEPGRAM_API_KEY`
- **Used For**:
  - Real-time speech-to-text
  - Audio transcription
  - Voice commands

## Usage in Functions

All Edge Functions automatically have access to these secrets. No additional configuration needed.

Example usage:
```typescript
const openAIKey = Deno.env.get('PurityHealthOpenai')
const geminiKey = Deno.env.get('PurityHealthGemini')
const twilioSid = Deno.env.get('TWILIO_ACCOUNT_SID')
```

## Deployment

When deploying new functions, they will automatically use these existing keys:
```bash
supabase functions deploy function-name
```

No need to set secrets again - they're already configured in your Supabase project!