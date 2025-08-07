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
  cyan: '\x1b[36m'
};

async function testAPI(name, endpoint, body) {
  console.log(`\n${colors.cyan}Testing ${name}...${colors.reset}`);
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log(`${colors.green}✓ ${name} API is working!${colors.reset}`);
      console.log(`${colors.blue}Response:${colors.reset}`, JSON.stringify(data, null, 2).slice(0, 200) + '...');
      return true;
    } else {
      console.log(`${colors.red}✗ ${name} API failed:${colors.reset}`, data.error || data);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}✗ ${name} API error:${colors.reset}`, error.message);
    return false;
  }
}

async function runTests() {
  console.log(`${colors.yellow}${'='.repeat(50)}`);
  console.log('API TESTING SUITE FOR PURITY HEALTH AI');
  console.log(`${'='.repeat(50)}${colors.reset}`);
  
  const results = [];
  
  // 1. Test OpenAI API
  results.push({
    name: 'OpenAI (GPT-4)',
    success: await testAPI('OpenAI (GPT-4)', 'ai-voice', {
      query: 'Hello, please respond with a brief greeting.',
      stream: false
    })
  });

  // 2. Test Google Gemini API
  results.push({
    name: 'Google Gemini',
    success: await testAPI('Google Gemini', 'gemini-chat', {
      query: 'Hello, please respond with a brief greeting.',
      stream: false
    })
  });

  // 3. Test Twilio SMS API (with a test mode flag)
  results.push({
    name: 'Twilio SMS',
    success: await testAPI('Twilio SMS', 'send-sms', {
      to: '+1234567890', // Test number
      body: 'Test message from Purity Health AI',
      test_mode: true // Add test mode to avoid actually sending
    })
  });

  // 4. Test Deepgram Speech-to-Text API
  // We'll test with a simple audio transcription endpoint
  console.log(`\n${colors.cyan}Testing Deepgram Speech-to-Text...${colors.reset}`);
  try {
    // Create a simple test by checking if the function exists
    const response = await fetch(`${SUPABASE_URL}/functions/v1/deepgram-transcribe`, {
      method: 'OPTIONS',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    if (response.ok) {
      console.log(`${colors.green}✓ Deepgram API endpoint exists!${colors.reset}`);
      results.push({ name: 'Deepgram STT', success: true });
    } else {
      console.log(`${colors.yellow}⚠ Deepgram API endpoint not deployed${colors.reset}`);
      results.push({ name: 'Deepgram STT', success: false });
    }
  } catch (error) {
    console.log(`${colors.red}✗ Deepgram API error:${colors.reset}`, error.message);
    results.push({ name: 'Deepgram STT', success: false });
  }

  // 5. Test ElevenLabs Text-to-Speech API
  results.push({
    name: 'ElevenLabs TTS',
    success: await testAPI('ElevenLabs TTS', 'eleven-speak', {
      text: 'Hello, this is a test from Purity Health AI.',
      voice_id: 'Rachel' // Default voice
    })
  });

  // Summary
  console.log(`\n${colors.yellow}${'='.repeat(50)}`);
  console.log('TEST RESULTS SUMMARY');
  console.log(`${'='.repeat(50)}${colors.reset}\n`);
  
  let passed = 0;
  let failed = 0;
  
  results.forEach(result => {
    if (result.success) {
      console.log(`${colors.green}✓ ${result.name}${colors.reset}`);
      passed++;
    } else {
      console.log(`${colors.red}✗ ${result.name}${colors.reset}`);
      failed++;
    }
  });
  
  console.log(`\n${colors.cyan}Total: ${results.length} APIs tested${colors.reset}`);
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
  
  if (failed === 0) {
    console.log(`\n${colors.green}🎉 All APIs are working correctly!${colors.reset}`);
  } else {
    console.log(`\n${colors.yellow}⚠ Some APIs need attention. Check the Supabase dashboard for more details.${colors.reset}`);
  }
}

// Run the tests
runTests().catch(console.error);