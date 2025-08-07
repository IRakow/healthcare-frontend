// Simple test script for Gemini API
// Run with: node test-gemini-api.js

async function testGeminiAPI() {
  console.log('Testing Gemini API directly...\n');
  
  try {
    // Call the Supabase function
    const response = await fetch('https://dhycdcugbjchktvqlroz.supabase.co/functions/v1/custom-meditation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoeWNkY3VnYmpjaGt0dnFscm96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMTk1MzQsImV4cCI6MjA2ODc5NTUzNH0.DknqvlCCYOSLe3olTMtRA8jAoNMRg17aAesYLuo6TUI'
      },
      body: JSON.stringify({
        topic: 'calm and peaceful relaxation',
        voice: 'Bella',
        model: 'Gemini',
        duration: 5,
        includeMusic: false,
        userId: null
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ API Error:', response.status);
      console.error('Error details:', JSON.stringify(data, null, 2));
      
      if (data.details && data.details.includes('API key not valid')) {
        console.error('\n⚠️  The GEMINI_API_KEY in Supabase is invalid or not set correctly.');
        console.error('Please check the Supabase dashboard and update the secret.');
      }
    } else {
      console.log('✅ Success! Gemini API is working.');
      console.log('Generated audio URL length:', data.audio_url ? data.audio_url.length : 0);
      
      if (data.audio_url) {
        console.log('\n🎵 Meditation audio was successfully generated!');
      }
    }
  } catch (error) {
    console.error('❌ Network or connection error:', error.message);
  }
}

testGeminiAPI();