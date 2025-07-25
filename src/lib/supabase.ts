// src/lib/supabase.ts
// Main Supabase client configuration
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dhycdcugbjchktvqlroz.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key-here'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export { supabase }
export default supabase
