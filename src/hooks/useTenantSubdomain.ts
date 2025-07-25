export function useTenantSubdomain() {
  const host = typeof window !== 'undefined' ? window.location.hostname : '';
  
  // Skip subdomain check for Vercel preview URLs and localhost
  if (host.includes('vercel.app') || host.includes('vercel.sh') || host === 'localhost') {
    console.log('Skipping subdomain check for Vercel/localhost:', host);
    return null;
  }
  
  const [subdomain] = host.split('.');
  
  // Skip for main domain variations
  if (subdomain === 'www' || subdomain === 'insperityhealth' || !subdomain) {
    return null;
  }
  
  console.log('Extracted subdomain:', subdomain, 'from host:', host);
  return subdomain;
}