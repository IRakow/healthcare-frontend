import { useEffect, useState } from 'react';
import { useTenantBranding } from '@/hooks/useTenantBranding';
import { useTenantSubdomain } from '@/hooks/useTenantSubdomain';
import ErrorPage from '@/pages/ErrorPage';

interface TenantRouterProps {
  children: React.ReactNode;
}

export default function TenantRouter({ children }: TenantRouterProps) {
  const subdomain = useTenantSubdomain();
  const { branding, loading } = useTenantBranding();
  const [isValidTenant, setIsValidTenant] = useState(true);

  useEffect(() => {
    // Check if we're on Vercel or localhost
    const host = typeof window !== 'undefined' ? window.location.hostname : '';
    const isVercelOrLocal = host.includes('vercel.app') || host.includes('vercel.sh') || host === 'localhost';
    
    // If we're on Vercel/localhost, always consider it valid
    if (isVercelOrLocal) {
      setIsValidTenant(true);
      return;
    }
    
    // If there's a subdomain but no branding found, it's invalid
    if (!loading && subdomain && !branding) {
      setIsValidTenant(false);
    }
    
    // If no subdomain (main site) or valid branding found, it's valid
    if (!subdomain || branding) {
      setIsValidTenant(true);
    }
  }, [subdomain, branding, loading]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Route to marketing site for main domain (but not for Vercel or localhost)
  if (!subdomain && typeof window !== 'undefined') {
    const host = window.location.hostname;
    const isVercelOrLocal = host.includes('vercel.app') || host.includes('vercel.sh') || host === 'localhost';
    
    // Only redirect to marketing site if we're on the actual production domain
    if (!isVercelOrLocal && window.location.pathname === '/') {
      window.location.href = 'https://insperityhealth.com/marketing';
      return null;
    }
  }

  // Show error for unknown organizations
  if (!isValidTenant) {
    return (
      <ErrorPage 
        message="Unknown organization" 
        description={`The organization "${subdomain}" was not found. Please check the URL and try again.`}
        showHomeButton={true}
      />
    );
  }

  // Valid tenant or main site - render the app
  return <>{children}</>;
}