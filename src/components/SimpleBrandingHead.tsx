import { useBranding } from '@/lib/useBranding';
import { Helmet } from 'react-helmet-async';

export function BrandingHead() {
  const branding = useBranding();
  return (
    <Helmet>
      {branding.favicon_url && (
        <link rel="icon" type="image/png" href={branding.favicon_url} />
      )}
    </Helmet>
  );
}