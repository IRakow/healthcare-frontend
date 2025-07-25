export function useTenantSubdomain() {
  const host = typeof window !== 'undefined' ? window.location.hostname : '';
  const [subdomain] = host.split('.');
  
  // Skip subdomain check for Vercel preview URLs
  if (host.includes('vercel.app') || host === 'localhost') {
    return null;
  }
  
  return subdomain === 'www' || subdomain === 'insperityhealth' ? null : subdomain;
}