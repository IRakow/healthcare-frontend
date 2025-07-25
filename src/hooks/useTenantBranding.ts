import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useTenantSubdomain } from './useTenantSubdomain';

interface TenantBranding {
  id: string;
  name: string;
  logo_url?: string;
  favicon_url?: string;
  primary_color: string;
  voice_profile: string;
  tagline?: string;
}

export function useTenantBranding() {
  const subdomain = useTenantSubdomain();
  const [branding, setBranding] = useState<TenantBranding | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTenantBranding() {
      if (!subdomain) {
        // No subdomain, use default branding
        setBranding({
          id: 'default',
          name: 'Insperity Health',
          primary_color: '#3B82F6',
          voice_profile: 'Rachel'
        });
        setLoading(false);
        return;
      }

      try {
        // Load employer by subdomain
        const { data: employer } = await supabase
          .from('employers')
          .select('*')
          .eq('subdomain', subdomain)
          .single();

        if (employer) {
          setBranding({
            id: employer.id,
            name: employer.name,
            logo_url: employer.logo_url,
            favicon_url: employer.favicon_url,
            primary_color: employer.primary_color || '#3B82F6',
            voice_profile: employer.voice_profile || 'Rachel',
            tagline: employer.tagline
          });
        } else {
          // Subdomain not found, set branding to null
          setBranding(null);
        }
      } catch (error) {
        console.error('Error loading tenant branding:', error);
        // Set to null on error for subdomain
        setBranding(null);
      } finally {
        setLoading(false);
      }
    }

    loadTenantBranding();
  }, [subdomain]);

  // Update favicon dynamically
  useEffect(() => {
    if (branding?.favicon_url && typeof document !== 'undefined') {
      const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement || 
                   document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      link.href = branding.favicon_url;
      document.getElementsByTagName('head')[0].appendChild(link);
    }
  }, [branding?.favicon_url]);

  return { branding, loading, subdomain };
}