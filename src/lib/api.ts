import { createClient } from '@supabase/supabase-js';

// ✅ Your actual project credentials
const supabaseUrl = 'https://dhycdcugbjchktvqlroz.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoeWNkY3VnYmpjaGt0dnFscm96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMTk1MzQsImV4cCI6MjA2ODc5NTUzNH0.DknqvlCCYOSLe3olTMtRA8jAoNMRg17aAesYLuo6TUI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
