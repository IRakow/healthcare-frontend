import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { supabase } from '@/lib/supabase';

interface BrandingData {
  favicon_url?: string;
  logo_url?: string;
  primary_color?: string;
  tagline?: string;
  subdomain?: string;
  employer_name?: string;
  voice_profile?: string;
}

interface BrandingContextType {
  employerId?: string;
  branding: BrandingData;
  setEmployerId: (id: string | undefined) => void;
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export const useBrandingContext = () => {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error('useBrandingContext must be used within BrandingProvider');
  }
  return context;
};

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [employerId, setEmployerId] = useState<string | undefined>();
  const [branding, setBranding] = useState<BrandingData>({
    favicon_url: '/favicon.ico',
    primary_color: '#3B82F6',
    employer_name: 'Purity Health',
  });

  useEffect(() => {
    checkUserEmployer();
  }, []);

  useEffect(() => {
    if (employerId) {
      loadBrandingByEmployerId(employerId);
    } else {
      // Optional: check subdomain when no user is logged in
      const host = window?.location.hostname;
      const subdomain = host?.split('.')[0];
      const isLocal = host === 'localhost';

      if (subdomain && !isLocal && subdomain !== 'www') {
        loadBrandingBySubdomain(subdomain);
      }
    }
  }, [employerId]);

  async function checkUserEmployer() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('users')
          .select('employer_id')
          .eq('id', user.id)
          .single();

        if (data?.employer_id) {
          setEmployerId(data.employer_id);
        }
      }
    } catch (error) {
      console.error('Error checking user employer:', error);
    }
  }

  async function loadBrandingByEmployerId(id: string) {
    try {
      const { data, error } = await supabase
        .from('employers')
        .select(
          'name, logo_url, favicon_url, primary_color, tagline, subdomain, voice_profile'
        )
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) applyBranding(data);
    } catch (error) {
      console.error('Error loading branding by employer ID:', error);
    }
  }

  async function loadBrandingBySubdomain(subdomain: string) {
    try {
      const { data, error } = await supabase
        .from('employers')
        .select(
          'name, logo_url, favicon_url, primary_color, tagline, subdomain, voice_profile'
        )
        .eq('subdomain', subdomain)
        .single();

      if (error) throw error;
      if (data) applyBranding(data);
    } catch (error) {
      console.error('Error loading branding by subdomain:', error);
    }
  }

  function applyBranding(data: any) {
    // Inject favicon
    if (data.favicon_url) {
      const existing = document.querySelector("link[rel='icon']") as HTMLLinkElement;
      if (existing) {
        existing.href = data.favicon_url;
      } else {
        const link = document.createElement('link');
        link.rel = 'icon';
        link.href = data.favicon_url;
        document.head.appendChild(link);
      }
    }

    // Inject CSS variable
    if (data.primary_color) {
      document.documentElement.style.setProperty('--brand-primary', data.primary_color);
    }

    setBranding({
      favicon_url: data.favicon_url || '/favicon.ico',
      logo_url: data.logo_url || '',
      primary_color: data.primary_color || '#3B82F6',
      tagline: data.tagline || '',
      subdomain: data.subdomain || '',
      employer_name: data.name || 'Purity Health',
      voice_profile: data.voice_profile || undefined,
    });
  }

  return (
    <BrandingContext.Provider value={{ employerId, branding, setEmployerId }}>
      {children}
    </BrandingContext.Provider>
  );
}
