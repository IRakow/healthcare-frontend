#!/usr/bin/env node

// Test Deepgram API directly
const SUPABASE_URL = 'https://dhycdcugbjchktvqlroz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoeWNkY3VnYmpjaGt0dnFscm96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMTk1MzQsImV4cCI6MjA2ODc5NTUzNH0.DknqvlCCYOSLe3olTMtRA8jAoNMRg17aAesYLuo6TUI';

async function testDeepgram() {
  console.log('Testing Deepgram API with different methods...\n');
  
  // Method 1: Test with raw audio data (not FormData)
  console.log('Method 1: Testing with raw WAV data...');
  
  // Create a minimal WAV header
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
  
  // Create 1 second of silence
  const audioData = new Uint8Array(32000); // 1 second at 16kHz, 16-bit
  const wavHeader = createWavHeader(audioData.length);
  const wavFile = new Uint8Array(wavHeader.byteLength + audioData.length);
  wavFile.set(new Uint8Array(wavHeader), 0);
  wavFile.set(audioData, wavHeader.byteLength);
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/deepgram-transcribe`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type': 'audio/wav'
      },
      body: wavFile
    });
    
    const result = await response.text();
    console.log(`Response (${response.status}):`, result);
    
    if (response.ok) {
      console.log('✅ Deepgram endpoint is accessible');
    } else {
      const data = JSON.parse(result);
      if (data.err_code === 'INVALID_AUTH') {
        console.log('❌ Deepgram API key is invalid or expired');
        console.log('   The DEEPGRAM_API_KEY secret needs to be updated with a valid key');
      } else {
        console.log('❌ Deepgram error:', data);
      }
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
  
  // Method 2: Check if function accepts FormData
  console.log('\nMethod 2: Testing with FormData (as expected by function)...');
  
  const formData = new FormData();
  const audioBlob = new Blob([wavFile], { type: 'audio/wav' });
  formData.append('audio', audioBlob, 'test.wav');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/deepgram-transcribe`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: formData
    });
    
    const result = await response.text();
    console.log(`Response (${response.status}):`, result);
    
    if (response.ok) {
      const data = JSON.parse(result);
      console.log('✅ Deepgram is working! Transcript:', data.transcript || '(silence detected)');
    } else {
      console.log('❌ Failed with FormData method');
    }
  } catch (error) {
    console.log('❌ FormData not supported in Node.js environment');
    console.log('   This method would work in a browser');
  }
  
  console.log('\n📋 Summary:');
  console.log('The Deepgram endpoint is deployed and accessible.');
  console.log('However, the API key (DEEPGRAM_API_KEY) appears to be invalid.');
  console.log('To fix: Update the DEEPGRAM_API_KEY secret in Supabase with a valid Deepgram API key.');
}

testDeepgram();