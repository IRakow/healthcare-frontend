// File: src/components/TenantRouter.tsx

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

  const host = typeof window !== 'undefined' ? window.location.hostname : '';
  const isLocalOrPreview =
    host.includes('vercel.app') || host.includes('vercel.sh') || host.includes('run.app') || host === 'localhost' || host === '127.0.0.1';

  // Inject favicon and brand CSS
  useEffect(() => {
    if (branding) {
      if (branding.favicon_url) {
        const existing = document.querySelector("link[rel='icon']") as HTMLLinkElement;
        if (existing) {
          existing.href = branding.favicon_url;
        } else {
          const link = document.createElement('link');
          link.rel = 'icon';
          link.href = branding.favicon_url;
          document.head.appendChild(link);
        }
      }
      if (branding.primary_color) {
        document.documentElement.style.setProperty('--brand-primary', branding.primary_color);
      }
    }
  }, [branding]);

  // Validate tenant branding
  useEffect(() => {
    if (isLocalOrPreview) {
      setIsValidTenant(true);
      return;
    }
    if (!loading && subdomain && !branding) {
      setIsValidTenant(false);
    }
    if (!subdomain || branding) {
      setIsValidTenant(true);
    }
  }, [subdomain, branding, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center animate-fade-in">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-blue-500 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading your branded experience...</p>
        </div>
      </div>
    );
  }

  if (!subdomain && !isLocalOrPreview && typeof window !== 'undefined') {
    if (window.location.pathname === '/') {
      window.location.href = 'https://insperityhealth.com/marketing';
      return null;
    }
  }

  if (!isValidTenant) {
    return (
      <ErrorPage
        message="Unknown Organization"
        description={`The organization "${subdomain}" was not found. Please check the URL or contact your provider.`}
        showHomeButton={true}
      />
    );
  }

  return <>{children}</>;
}