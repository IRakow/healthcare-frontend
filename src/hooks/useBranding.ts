import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Branding {
  logo_url?: string;
  favicon_url?: string;
  primary_color: string;
  voice_profile: string;
  tagline?: string;
}

export function useBranding() {
  const [branding, setBranding] = useState<Branding | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBranding() {
      try {
        const user = supabase.auth.user();
        
        // Get user's employer
        const { data: userData } = await supabase
          .from('users')
          .select('employer_id')
          .eq('id', user.id)
          .single();

        if (userData?.employer_id) {
          // Get employer's branding
          const { data: employer } = await supabase
            .from('employers')
            .select('logo_url, favicon_url, primary_color, voice_profile, tagline')
            .eq('id', userData.employer_id)
            .single();

          if (employer) {
            setBranding({
              logo_url: employer.logo_url,
              favicon_url: employer.favicon_url,
              primary_color: employer.primary_color || '#3B82F6',
              voice_profile: employer.voice_profile || 'Rachel',
              tagline: employer.tagline
            });
          }
        }
      } catch (error) {
        console.error('Error loading branding:', error);
      } finally {
        setLoading(false);
      }
    }

    loadBranding();
  }, []);

  return branding;
}