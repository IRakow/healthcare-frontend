#!/usr/bin/env node

// Test script for all APIs through Supabase Edge Functions
const SUPABASE_URL = 'https://dhycdcugbjchktvqlroz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoeWNkY3VnYmpjaGt0dnFscm96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMTk1MzQsImV4cCI6MjA2ODc5NTUzNH0.DknqvlCCYOSLe3olTMtRA8jAoNMRg17aAesYLuo6TUI';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

async function testAPI(name, endpoint, body, options = {}) {
  console.log(`\n${colors.cyan}Testing ${name}...${colors.reset}`);
  
  try {
    const headers = {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      ...options.headers
    };
    
    if (!options.isAudio) {
      headers['Content-Type'] = 'application/json';
    }
    
    const fetchOptions = {
      method: options.method || 'POST',
      headers
    };
    
    if (body && !options.isAudio) {
      fetchOptions.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/${endpoint}`, fetchOptions);

    if (options.expectBinary) {
      const buffer = await response.arrayBuffer();
      if (response.ok && buffer.byteLength > 0) {
        console.log(`${colors.green}✓ ${name} API is working!${colors.reset}`);
        console.log(`${colors.blue}Response: Received ${buffer.byteLength} bytes of audio data${colors.reset}`);
        return true;
      } else {
        console.log(`${colors.red}✗ ${name} API failed: No audio data received${colors.reset}`);
        return false;
      }
    }
    
    const text = await response.text();
    let data;
    
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
    
    if (response.ok) {
      console.log(`${colors.green}✓ ${name} API is working!${colors.reset}`);
      if (typeof data === 'object') {
        const preview = JSON.stringify(data, null, 2);
        console.log(`${colors.blue}Response:${colors.reset}`, preview.slice(0, 300) + (preview.length > 300 ? '...' : ''));
      } else {
        console.log(`${colors.blue}Response:${colors.reset}`, data.slice(0, 300) + (data.length > 300 ? '...' : ''));
      }
      return true;
    } else {
      console.log(`${colors.red}✗ ${name} API failed (${response.status}):${colors.reset}`);
      if (typeof data === 'object' && data.error) {
        console.log(data.error);
      } else {
        console.log(data);
      }
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}✗ ${name} API error:${colors.reset}`, error.message);
    return false;
  }
}

async function runTests() {
  console.log(`${colors.magenta}${'='.repeat(60)}`);
  console.log('         API TESTING SUITE FOR PURITY HEALTH AI');
  console.log(`${'='.repeat(60)}${colors.reset}`);
  
  const results = [];
  
  // 1. Test OpenAI API (using the actual deployed function)
  console.log(`\n${colors.yellow}1. OPENAI GPT-4 API${colors.reset}`);
  results.push({
    name: 'OpenAI Assistant',
    success: await testAPI('OpenAI Assistant', 'openai-assistant', {
      query: 'Say "Hello from OpenAI" in exactly 5 words.',
      stream: false
    })
  });

  // Alternative OpenAI endpoint
  results.push({
    name: 'OpenAI Voice AI',
    success: await testAPI('OpenAI Voice AI', 'ai-voice', {
      query: 'Say "Hello from AI Voice" in exactly 5 words.',
      stream: false
    })
  });

  // 2. Test Google Gemini API
  console.log(`\n${colors.yellow}2. GOOGLE GEMINI API${colors.reset}`);
  results.push({
    name: 'Gemini Assistant',
    success: await testAPI('Gemini Assistant', 'gemini-assistant', {
      query: 'Say "Hello from Gemini" in exactly 5 words.',
      stream: false
    })
  });

  // 3. Test symptom checker (uses Gemini)
  results.push({
    name: 'Symptom Checker (Gemini)',
    success: await testAPI('Symptom Checker', 'symptom-checker', {
      symptoms: 'headache and fever',
      age: 30,
      gender: 'male'
    })
  });

  // 4. Test ElevenLabs Text-to-Speech API
  console.log(`\n${colors.yellow}3. ELEVENLABS TEXT-TO-SPEECH API${colors.reset}`);
  results.push({
    name: 'ElevenLabs TTS',
    success: await testAPI('ElevenLabs TTS', 'eleven-speak', {
      query: 'Hello, this is a test from Purity Health AI.'
    }, { expectBinary: true })
  });

  // 5. Test Deepgram Speech-to-Text API (check if endpoint exists)
  console.log(`\n${colors.yellow}4. DEEPGRAM SPEECH-TO-TEXT API${colors.reset}`);
  console.log(`${colors.cyan}Testing Deepgram transcription endpoint...${colors.reset}`);
  
  // Create a simple WAV header for testing
  const createWavHeader = (dataSize) => {
    const buffer = new ArrayBuffer(44);
    const view = new DataView(buffer);
    
    // "RIFF" chunk descriptor
    view.setUint32(0, 0x52494646, false); // "RIFF"
    view.setUint32(4, dataSize + 36, true); // file size - 8
    view.setUint32(8, 0x57415645, false); // "WAVE"
    
    // "fmt " sub-chunk
    view.setUint32(12, 0x666d7420, false); // "fmt "
    view.setUint32(16, 16, true); // subchunk size
    view.setUint16(20, 1, true); // audio format (PCM)
    view.setUint16(22, 1, true); // number of channels
    view.setUint32(24, 16000, true); // sample rate
    view.setUint32(28, 32000, true); // byte rate
    view.setUint16(32, 2, true); // block align
    view.setUint16(34, 16, true); // bits per sample
    
    // "data" sub-chunk
    view.setUint32(36, 0x64617461, false); // "data"
    view.setUint32(40, dataSize, true); // data size
    
    return buffer;
  };
  
  // Create minimal test audio
  const audioData = new Uint8Array(1000); // Small silent audio
  const wavHeader = createWavHeader(audioData.length);
  const testAudio = new Uint8Array(wavHeader.byteLength + audioData.length);
  testAudio.set(new Uint8Array(wavHeader), 0);
  testAudio.set(audioData, wavHeader.byteLength);
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/deepgram-transcribe`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'audio/wav'
      },
      body: testAudio
    });
    
    const result = await response.text();
    
    if (response.ok) {
      console.log(`${colors.green}✓ Deepgram STT API is working!${colors.reset}`);
      console.log(`${colors.blue}Response:${colors.reset}`, result.slice(0, 200));
      results.push({ name: 'Deepgram STT', success: true });
    } else {
      console.log(`${colors.red}✗ Deepgram STT API failed:${colors.reset}`, result);
      results.push({ name: 'Deepgram STT', success: false });
    }
  } catch (error) {
    console.log(`${colors.red}✗ Deepgram STT API error:${colors.reset}`, error.message);
    results.push({ name: 'Deepgram STT', success: false });
  }

  // 6. Test Twilio (Note: SMS functions might not be deployed)
  console.log(`\n${colors.yellow}5. TWILIO SMS API${colors.reset}`);
  console.log(`${colors.cyan}Checking for Twilio/SMS endpoints...${colors.reset}`);
  
  // Check if any SMS endpoints exist
  const smsEndpoints = ['send-sms', 'twilio-sms', 'sms'];
  let twilioFound = false;
  
  for (const endpoint of smsEndpoints) {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/${endpoint}`, {
        method: 'OPTIONS',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        }
      });
      
      if (response.ok || response.status === 405) { // 405 means endpoint exists but doesn't support OPTIONS
        console.log(`${colors.yellow}⚠ Twilio SMS endpoint '${endpoint}' found but not tested (to avoid sending real SMS)${colors.reset}`);
        twilioFound = true;
        break;
      }
    } catch (error) {
      // Continue checking other endpoints
    }
  }
  
  if (!twilioFound) {
    console.log(`${colors.yellow}⚠ No Twilio SMS endpoints found (this is normal if SMS is handled differently)${colors.reset}`);
  }
  results.push({ name: 'Twilio SMS', success: twilioFound });

  // Summary
  console.log(`\n${colors.magenta}${'='.repeat(60)}`);
  console.log('                    TEST RESULTS SUMMARY');
  console.log(`${'='.repeat(60)}${colors.reset}\n`);
  
  let passed = 0;
  let failed = 0;
  
  results.forEach(result => {
    if (result.success) {
      console.log(`  ${colors.green}✓ ${result.name}${colors.reset}`);
      passed++;
    } else {
      console.log(`  ${colors.red}✗ ${result.name}${colors.reset}`);
      failed++;
    }
  });
  
  console.log(`\n${colors.cyan}Total APIs tested: ${results.length}${colors.reset}`);
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
  
  if (failed === 0) {
    console.log(`\n${colors.green}🎉 All APIs are working correctly!${colors.reset}`);
  } else if (passed > failed) {
    console.log(`\n${colors.yellow}⚠ Most APIs are working. Some may need API keys configured in Supabase.${colors.reset}`);
    console.log(`${colors.blue}To fix: Check Supabase dashboard > Edge Functions > Secrets${colors.reset}`);
  } else {
    console.log(`\n${colors.red}❌ Multiple APIs need attention.${colors.reset}`);
    console.log(`${colors.blue}To fix: Configure API keys in Supabase dashboard > Edge Functions > Secrets${colors.reset}`);
  }
  
  // Provide helpful information
  console.log(`\n${colors.yellow}Required API Keys in Supabase:${colors.reset}`);
  console.log('  • PurityHealthOpenai - OpenAI API key');
  console.log('  • PurityHealthGemini - Google Gemini API key');
  console.log('  • ELEVENLABS_API_KEY - ElevenLabs API key');
  console.log('  • BDInsperityHealthDeepGram - Deepgram API key');
  console.log('  • TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN - Twilio credentials');
}

// Run the tests
runTests().catch(console.error);