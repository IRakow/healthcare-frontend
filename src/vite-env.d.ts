/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_SUPABASE_FN_BASE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module "*.json" {
  const value: any;
  export default value;
}

declare module "*.mp3" {
  const src: string;
  export default src;
}