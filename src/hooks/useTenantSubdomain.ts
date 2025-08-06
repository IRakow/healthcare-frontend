export function useTenantSubdomain(): string | null {
  if (typeof window === 'undefined') return null;

  const host = window.location.hostname;

  const isPreview = host.includes('vercel.app') || host.includes('vercel.sh') || host.includes('run.app') || host === 'localhost' || host === '127.0.0.1';
  if (isPreview) return null;

  const parts = host.split('.');
  if (parts.length > 2) return parts[0]; // example: acme.myplatform.com → 'acme'
  return null;
}