// Detailed test for meditation function
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://dhycdcugbjchktvqlroz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoeWNkY3VnYmpjaGt0dnFscm96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMTk1MzQsImV4cCI6MjA2ODc5NTUzNH0.DknqvlCCYOSLe3olTMtRA8jAoNMRg17aAesYLuo6TUI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testMeditation() {
  console.log('Testing meditation generation exactly as frontend does...\n');
  
  try {
    // Test with user authentication (optional)
    const { data: { user } } = await supabase.auth.getUser();
    console.log('User:', user ? 'Logged in' : 'Not logged in');
    
    const params = {
      topic: 'peaceful relaxation',
      voice: 'Bella',
      model: 'Gemini',
      duration: 5,
      includeMusic: false,
      userId: user?.id || null
    };
    
    console.log('Invoking function with params:', params);
    
    const { data, error } = await supabase.functions.invoke('custom-meditation', {
      body: params
    });
    
    if (error) {
      console.error('\n❌ Error from Supabase:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      // Check specific error types
      if (error.message?.includes('not found')) {
        console.error('\n⚠️  Function not found. It may need to be deployed.');
      } else if (error.message?.includes('unauthorized')) {
        console.error('\n⚠️  Authentication issue. Check Supabase settings.');
      }
    } else if (data?.error) {
      console.error('\n❌ Error from function:', data.error);
      console.error('Details:', data.details);
      
      if (data.details?.includes('API key not valid')) {
        console.error('\n⚠️  The GEMINI_API_KEY is invalid.');
      }
    } else if (data?.audio_url) {
      console.log('\n✅ Success! Audio generated.');
      console.log('Audio URL length:', data.audio_url.length);
    } else {
      console.error('\n❌ Unexpected response:', data);
    }
    
  } catch (err) {
    console.error('\n❌ Caught error:', err);
    console.error('Stack:', err.stack);
  }
}

testMeditation();