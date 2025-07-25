// src/lib/supabase.ts
// Main Supabase client configuration
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dhycdcugbjchktvqlroz.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoeWNkY3VnYmpjaGt0dnFscm96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMTk1MzQsImV4cCI6MjA2ODc5NTUzNH0.DknqvlCCYOSLe3olTMtRA8jAoNMRg17aAesYLuo6TUI'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export { supabase }
export default supabase
