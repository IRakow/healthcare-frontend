import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface Branding {
  favicon_url?: string;
  logo_url?: string;
  primary_color?: string;
  tagline?: string;
  subdomain?: string;
  employer_name?: string;
}

export function useBranding(employerId?: string): Branding {
  const [branding, setBranding] = useState<Branding>({});

  useEffect(() => {
    if (!employerId) {
      // Set default branding
      setBranding({
        favicon_url: '/favicon.ico',
        employer_name: 'Insperity Health',
      });
      return;
    }

    loadBranding();
  }, [employerId]);

  async function loadBranding() {
    try {
      const { data, error } = await supabase
        .from('employers')
        .select('name, logo_url, favicon_url, primary_color, tagline, subdomain')
        .eq('id', employerId!)
        .single();

      if (error) throw error;

      if (data) {
        setBranding({
          favicon_url: data.favicon_url || '/favicon.ico',
          logo_url: data.logo_url,
          primary_color: data.primary_color || '#3B82F6',
          tagline: data.tagline,
          subdomain: data.subdomain,
          employer_name: data.name,
        });
      }
    } catch (error) {
      console.error('Error loading branding:', error);
      // Fallback to defaults
      setBranding({
        favicon_url: '/favicon.ico',
        employer_name: 'Insperity Health',
      });
    }
  }

  return branding;
}