import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Employer } from '@/types/employer';

export function useEmployerBranding(employerId?: string) {
  const [branding, setBranding] = useState<{
    logoUrl?: string;
    faviconUrl?: string;
    primaryColor?: string;
    tagline?: string;
    subdomain?: string;
  }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!employerId) {
      setLoading(false);
      return;
    }

    loadEmployerBranding();
  }, [employerId]);

  async function loadEmployerBranding() {
    try {
      const { data, error } = await supabase
        .from('employers')
        .select('logo_url, favicon_url, primary_color, tagline, subdomain')
        .eq('id', employerId!)
        .single();

      if (error) throw error;

      if (data) {
        setBranding({
          logoUrl: data.logo_url,
          faviconUrl: data.favicon_url,
          primaryColor: data.primary_color,
          tagline: data.tagline,
          subdomain: data.subdomain,
        });

        // Apply favicon if available
        if (data.favicon_url) {
          updateFavicon(data.favicon_url);
        }

        // Apply primary color as CSS variable
        if (data.primary_color) {
          document.documentElement.style.setProperty('--primary-color', data.primary_color);
          // Also set tailwind color variables
          document.documentElement.style.setProperty('--tw-primary', data.primary_color);
        }
      }
    } catch (error) {
      console.error('Error loading employer branding:', error);
    } finally {
      setLoading(false);
    }
  }

  function updateFavicon(url: string) {
    // Remove existing favicons
    const existingLinks = document.querySelectorAll("link[rel*='icon']");
    existingLinks.forEach(link => link.remove());

    // Add new favicon
    const link = document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = url;
    document.getElementsByTagName('head')[0].appendChild(link);

    // Also add as icon
    const iconLink = document.createElement('link');
    iconLink.rel = 'icon';
    iconLink.href = url;
    document.getElementsByTagName('head')[0].appendChild(iconLink);
  }

  return { branding, loading };
}

// Hook to apply branding styles
export function useApplyBranding(primaryColor?: string) {
  useEffect(() => {
    if (!primaryColor) return;

    // Create style element for dynamic primary color
    const styleId = 'employer-branding-styles';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;
    
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    // Apply primary color to various Tailwind classes
    styleElement.textContent = `
      :root {
        --employer-primary: ${primaryColor};
      }
      
      .bg-primary { background-color: ${primaryColor} !important; }
      .text-primary { color: ${primaryColor} !important; }
      .border-primary { border-color: ${primaryColor} !important; }
      
      .hover\\:bg-primary:hover { background-color: ${primaryColor} !important; }
      .hover\\:text-primary:hover { color: ${primaryColor} !important; }
      
      .focus\\:ring-primary:focus { 
        --tw-ring-color: ${primaryColor};
        --tw-ring-opacity: 0.5;
      }
    `;

    return () => {
      // Cleanup on unmount
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, [primaryColor]);
}