# Supabase Edge Functions Setup Guide

## Overview
This guide will help you set up the AI voice functionality using Supabase Edge Functions with OpenAI, Google Gemini, ElevenLabs, and Deepgram integrations. The system includes real-time speech recognition, text-to-speech, and medical-specific AI assistance.

## Prerequisites
1. Supabase CLI installed: `npm install -g supabase`
2. Supabase project created
3. API keys for:
   - OpenAI (GPT-4)
   - Google Gemini Pro
   - ElevenLabs (Text-to-Speech)
   - Deepgram (Speech-to-Text)

## Environment Variables Setup

### 1. Local Development (.env.local)
```bash
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# These are for local testing only
VITE_OPENAI_KEY=your-openai-key
VITE_GEMINI_KEY=your-gemini-key
VITE_ELEVENLABS_KEY=your-elevenlabs-key
VITE_DEEPGRAM_KEY=your-deepgram-key
```

### 2. Supabase Edge Functions Secrets
Set these secrets in your Supabase project:

```bash
# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Set secrets for Edge Functions
supabase secrets set PurityHealthOpenai=your-openai-api-key
supabase secrets set PurityHealthGemini=your-gemini-api-key
supabase secrets set ELEVENLABS_API_KEY=your-elevenlabs-api-key
supabase secrets set BDInsperityHealthDeepGram=your-deepgram-api-key
```

## Deploying Supabase Functions

### 1. Deploy Individual Functions
```bash
# Deploy AI Voice Function (OpenAI)
supabase functions deploy ai-voice

# Deploy Gemini Chat Function
supabase functions deploy gemini-chat

# Deploy ElevenLabs TTS Function
supabase functions deploy eleven-speak

# Deploy Deepgram Transcription Function
supabase functions deploy deepgram-transcribe

# Deploy Deepgram Real-time Streaming Function
supabase functions deploy deepgram-stream

# Deploy Enhanced ElevenLabs Streaming Function
supabase functions deploy eleven-speak-stream
```

### 2. Deploy All Functions at Once
```bash
supabase functions deploy
```

## Testing the Functions

### 1. Test AI Voice Function
```bash
curl -L -X POST 'https://your-project.supabase.co/functions/v1/ai-voice' \
  -H 'Authorization: Bearer your-anon-key' \
  -H 'Content-Type: application/json' \
  -d '{"query": "Hello, how can I help you today?"}'
```

### 2. Test Gemini Chat Function
```bash
curl -L -X POST 'https://your-project.supabase.co/functions/v1/gemini-chat' \
  -H 'Authorization: Bearer your-anon-key' \
  -H 'Content-Type: application/json' \
  -d '{"query": "What is the capital of France?", "stream": true}'
```

### 3. Test ElevenLabs TTS
```bash
curl -L -X POST 'https://your-project.supabase.co/functions/v1/eleven-speak' \
  -H 'Authorization: Bearer your-anon-key' \
  -H 'Content-Type: application/json' \
  -d '{"text": "Hello, this is a test message."}' \
  --output test-audio.mp3
```

### 4. Test Deepgram Transcription
```bash
curl -L -X POST 'https://your-project.supabase.co/functions/v1/deepgram-transcribe' \
  -H 'Authorization: Bearer your-anon-key' \
  -H 'Content-Type: audio/wav' \
  --data-binary @your-audio-file.wav
```

## Integration in React Components

The components are already configured to use these functions:

1. **AssistantBar.tsx** - AI chat with text-to-speech (OpenAI)
2. **VoiceAssistant.tsx** - Voice input with AI responses
3. **AIProviderSelector.tsx** - Switch between OpenAI and Gemini with voice support
4. **EnhancedAIAssistant.tsx** - Full-featured voice assistant with real-time transcription
5. **MedicalVoiceAssistant.tsx** - Medical-specific voice assistant with context awareness
6. **VoiceSettings.tsx** - Voice customization with 9 different voices

### React Hooks:
1. **useTextToSpeech** - Reusable TTS functionality with streaming support
2. **useSpeechRecognition** - Real-time speech recognition with Deepgram fallback

All components automatically use the Supabase Functions when deployed.

## Troubleshooting

### Common Issues:

1. **CORS Errors**
   - Ensure your Supabase project allows requests from your domain
   - Add CORS headers in Edge Functions if needed

2. **Authentication Errors**
   - Verify your anon key is correct
   - Check that secrets are properly set in Supabase

3. **API Rate Limits**
   - Monitor usage in OpenAI, ElevenLabs, and Deepgram dashboards
   - Implement rate limiting in your application

### Debug Commands:
```bash
# View function logs
supabase functions logs ai-voice

# Test locally
supabase functions serve ai-voice
```

## Production Checklist

- [ ] Set all required secrets in Supabase dashboard
- [ ] Deploy all three Edge Functions
- [ ] Update environment variables in production
- [ ] Test each function endpoint
- [ ] Monitor logs for errors
- [ ] Set up error alerting

## Voice Models Configuration

### ElevenLabs Voice IDs
Current default: `Rachel`

Available voices:
- Rachel (default)
- Domi
- Bella
- Antoni
- Elli
- Josh
- Arnold
- Adam
- Sam

To change the voice, update the `voiceId` in `eleven-speak/index.ts`.

### Deepgram Models
Current: Default model

For better accuracy, you can specify:
- `model: 'nova-2'` for latest model
- `language: 'en-US'` for specific language

## Security Best Practices

1. Never commit API keys to version control
2. Use Supabase RLS policies to restrict access
3. Implement rate limiting for production
4. Monitor API usage and costs
5. Rotate API keys regularly

## Support

For issues:
1. Check Supabase Edge Functions documentation
2. Review API provider documentation
3. Check function logs: `supabase functions logs [function-name]`