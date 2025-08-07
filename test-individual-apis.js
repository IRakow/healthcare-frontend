#!/usr/bin/env node

const SUPABASE_URL = 'https://dhycdcugbjchktvqlroz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoeWNkY3VnYmpjaGt0dnFscm96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMTk1MzQsImV4cCI6MjA2ODc5NTUzNH0.DknqvlCCYOSLe3olTMtRA8jAoNMRg17aAesYLuo6TUI';

async function testElevenLabs() {
  console.log('\n🔊 Testing ElevenLabs TTS directly...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/eleven-speak`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        text: 'Hello, this is a test from Purity Health AI.'
        // Using default voice ID from function
      })
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.headers.get('content-type')?.includes('audio')) {
      const buffer = await response.arrayBuffer();
      console.log('✅ ElevenLabs: Received', buffer.byteLength, 'bytes of audio');
      return true;
    } else {
      const text = await response.text();
      console.log('❌ ElevenLabs response:', text);
      return false;
    }
  } catch (error) {
    console.log('❌ ElevenLabs error:', error.message);
    return false;
  }
}

async function testTwilioSMS() {
  console.log('\n📱 Testing Twilio SMS (test mode)...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/send-sms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        to: '+12025551234', // Test number
        body: 'Test message from Purity Health AI'
      })
    });
    
    const result = await response.text();
    console.log('Response status:', response.status);
    
    try {
      const data = JSON.parse(result);
      if (data.success) {
        console.log('✅ Twilio SMS: Message sent!', data);
      } else {
        console.log('❌ Twilio SMS error:', data);
      }
      return data.success;
    } catch {
      console.log('❌ Twilio SMS response:', result);
      return false;
    }
  } catch (error) {
    console.log('❌ Twilio SMS error:', error.message);
    return false;
  }
}

async function testDeepgram() {
  console.log('\n🎤 Testing Deepgram STT...');
  
  // Create a minimal WAV file
  const createWav = () => {
    const sampleRate = 16000;
    const numSamples = sampleRate; // 1 second
    const bytesPerSample = 2;
    const numChannels = 1;
    
    const buffer = new ArrayBuffer(44 + numSamples * bytesPerSample);
    const view = new DataView(buffer);
    
    // WAV header
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + numSamples * bytesPerSample, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // fmt chunk size
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * bytesPerSample, true);
    view.setUint16(32, numChannels * bytesPerSample, true);
    view.setUint16(34, bytesPerSample * 8, true);
    writeString(36, 'data');
    view.setUint32(40, numSamples * bytesPerSample, true);
    
    // Add some sine wave data
    for (let i = 0; i < numSamples; i++) {
      const value = Math.sin(2 * Math.PI * 440 * i / sampleRate) * 0x7FFF;
      view.setInt16(44 + i * 2, value, true);
    }
    
    return new Uint8Array(buffer);
  };
  
  try {
    const audioData = createWav();
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/deepgram-transcribe`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'audio/wav'
      },
      body: audioData
    });
    
    const result = await response.text();
    console.log('Response status:', response.status);
    
    try {
      const data = JSON.parse(result);
      if (data.transcript !== undefined) {
        console.log('✅ Deepgram: Transcription received:', data.transcript || '(empty/silence)');
        return true;
      } else if (data.err_code === 'INVALID_AUTH') {
        console.log('⚠️  Deepgram: API key is invalid or expired');
        console.log('   The API endpoint works but needs a valid DEEPGRAM_API_KEY');
        return false;
      } else {
        console.log('❌ Deepgram response:', data);
        return false;
      }
    } catch {
      console.log('❌ Deepgram response:', result);
      return false;
    }
  } catch (error) {
    console.log('❌ Deepgram error:', error.message);
    return false;
  }
}

async function main() {
  console.log('🧪 INDIVIDUAL API TESTING FOR PURITY HEALTH AI');
  console.log('='.repeat(50));
  
  const results = [];
  
  results.push({ name: 'ElevenLabs TTS', success: await testElevenLabs() });
  results.push({ name: 'Twilio SMS', success: await testTwilioSMS() });
  results.push({ name: 'Deepgram STT', success: await testDeepgram() });
  
  console.log('\n' + '='.repeat(50));
  console.log('SUMMARY:');
  results.forEach(r => {
    console.log(`${r.success ? '✅' : '❌'} ${r.name}`);
  });
  
  const working = results.filter(r => r.success).length;
  console.log(`\n${working}/${results.length} APIs working`);
  
  if (working < results.length) {
    console.log('\n💡 To fix non-working APIs:');
    console.log('1. Check API keys in Supabase dashboard');
    console.log('2. Verify API keys are valid and not expired');
    console.log('3. For ElevenLabs: Check if voice ID "Rachel" exists in your account');
    console.log('4. For Twilio: Verify phone number format and credentials');
  }
}

main().catch(console.error);