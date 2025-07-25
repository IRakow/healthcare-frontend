export function useTenantSubdomain() {
  const host = typeof window !== 'undefined' ? window.location.hostname : '';
  const [subdomain] = host.split('.');
  return subdomain === 'www' || subdomain === 'insperityhealth' ? null : subdomain;
}