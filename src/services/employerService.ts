import { supabase } from '@/lib/api'

export async function getEmployerBySubdomain() {
  const rawHostname = window.location.hostname

  // Extract subdomain or fallback to default if on localhost
  let subdomain = rawHostname.split('.')[0]
  if (rawHostname === 'localhost' || rawHostname === '127.0.0.1') {
    subdomain = 'localhost'
  }

  const { data, error } = await supabase
    .from('employers')
    .select('*')
    .eq('subdomain', subdomain)
    .maybeSingle()

  if (error || !data) {
    console.warn('⚠️ Employer not found for subdomain:', subdomain)
    return {
      name: 'Default',
      subdomain: 'default',
      branding: {}
    }
  }

  return data
}
