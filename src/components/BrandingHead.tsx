import { useBranding } from '@/lib/useBranding';
import { Helmet } from 'react-helmet-async';

interface BrandingHeadProps {
  employerId?: string;
  pageTitle?: string;
}

export function BrandingHead({ employerId, pageTitle }: BrandingHeadProps) {
  const branding = useBranding(employerId);
  
  const title = pageTitle 
    ? `${pageTitle} | ${branding.employer_name || 'Insperity Health'}`
    : branding.employer_name || 'Insperity Health';

  return (
    <Helmet>
      <title>{title}</title>
      
      {/* Favicon */}
      {branding.favicon_url && (
        <>
          <link rel="icon" type="image/png" href={branding.favicon_url} />
          <link rel="shortcut icon" href={branding.favicon_url} />
        </>
      )}
      
      {/* Primary Color as CSS Variable */}
      {branding.primary_color && (
        <style>{`
          :root {
            --brand-primary: ${branding.primary_color};
          }
          .bg-brand-primary { background-color: var(--brand-primary); }
          .text-brand-primary { color: var(--brand-primary); }
          .border-brand-primary { border-color: var(--brand-primary); }
        `}</style>
      )}
      
      {/* Meta tags */}
      <meta name="theme-color" content={branding.primary_color || '#3B82F6'} />
      {branding.tagline && <meta name="description" content={branding.tagline} />}
    </Helmet>
  );
}