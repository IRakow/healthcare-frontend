/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: 'https://dhycdcugbjchktvqlroz.supabase.co';
    readonly VITE_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRoeWNkY3VnYmpjaGt0dnFscm96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyMTk1MzQsImV4cCI6MjA2ODc5NTUzNH0.DknqvlCCYOSLe3olTMtRA8jAoNMRg17aAesYLuo6TUI';
    readonly VITE_SUPABASE_FN_BASE: 'https://dhycdcugbjchktvqlroz.functions.supabase.co';
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
  