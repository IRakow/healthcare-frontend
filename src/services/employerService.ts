import { supabase } from '@/lib/api'

export async function getEmployerBySubdomain() {
  const rawHostname = window.location.hostname
  const subdomain = rawHostname.split('.')[0]

  const { data, error } = await supabase
    .from('employers')
    .select('*')
    .eq('subdomain', subdomain)
    .maybeSingle()

  if (error) {
    console.error('❌ Failed to fetch employer:', error.message)
    return null
  }

  return data
}
