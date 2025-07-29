import { supabase } from '@/lib/api'

export async function getEmployerBySubdomain() {
  const subdomain = window.location.hostname.split('.')[0]

  const { data, error } = await supabase
    .from('employers')
    .select('*')
    .eq('subdomain', subdomain)
    .maybeSingle()

  if (error) {
    console.error('❌ Failed to load employer:', error.message)
    return null
  }

  return data
}