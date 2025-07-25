import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface BrandingContextType {
  employerId?: string;
  branding: {
    favicon_url?: string;
    logo_url?: string;
    primary_color?: string;
    tagline?: string;
    subdomain?: string;
    employer_name?: string;
  };
  setEmployerId: (id: string | undefined) => void;
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const [employerId, setEmployerId] = useState<string | undefined>();
  const [branding, setBranding] = useState<BrandingContextType['branding']>({});

  useEffect(() => {
    // Try to get employer ID from user's profile or session
    checkUserEmployer();
  }, []);

  useEffect(() => {
    if (employerId) {
      loadBranding();
    } else {
      // Reset to defaults
      setBranding({
        favicon_url: '/favicon.ico',
        employer_name: 'Insperity Health',
      });
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
    }
  }

  return (
    <BrandingContext.Provider value={{ employerId, branding, setEmployerId }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBrandingContext() {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error('useBrandingContext must be used within BrandingProvider');
  }
  return context;
}