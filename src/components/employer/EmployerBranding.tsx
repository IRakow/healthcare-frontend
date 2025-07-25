import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Image, FileIcon, Save, Loader2 } from 'lucide-react';
import { Employer } from '@/types/employer';

interface EmployerBrandingProps {
  employer: Employer;
  onUpdate?: (updatedEmployer: Employer) => void;
}

export function EmployerBranding({ employer, onUpdate }: EmployerBrandingProps) {
  const [logoUrl, setLogoUrl] = useState(employer.logo_url || '');
  const [faviconUrl, setFaviconUrl] = useState(employer.favicon_url || '');
  const [primaryColor, setPrimaryColor] = useState(employer.primary_color || '#3B82F6');
  const [tagline, setTagline] = useState(employer.tagline || '');
  const [subdomain, setSubdomain] = useState(employer.subdomain || '');
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);

  const handleFileUpload = async (file: File, type: 'logo' | 'favicon') => {
    const setUploading = type === 'logo' ? setUploadingLogo : setUploadingFavicon;
    setUploading(true);

    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${employer.id}/${type}_${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('employer-assets')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('employer-assets')
        .getPublicUrl(fileName);

      if (type === 'logo') {
        setLogoUrl(publicUrl);
      } else {
        setFaviconUrl(publicUrl);
      }
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      alert(`Failed to upload ${type}. Please try again.`);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const updates = {
        logo_url: logoUrl || null,
        favicon_url: faviconUrl || null,
        primary_color: primaryColor,
        tagline: tagline || null,
        subdomain: subdomain || null,
      };

      const { data, error } = await supabase
        .from('employers')
        .update(updates)
        .eq('id', employer.id)
        .select()
        .single();

      if (error) throw error;

      alert('Branding updated successfully!');
      
      if (onUpdate && data) {
        onUpdate(data);
      }
    } catch (error) {
      console.error('Error updating branding:', error);
      alert('Failed to update branding. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-6">Employer Branding</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo Upload */}
            <div>
              <Label>Company Logo</Label>
              <p className="text-sm text-gray-500 mb-2">Recommended: 200x60px PNG or SVG</p>
              
              <div className="space-y-3">
                {logoUrl && (
                  <div className="p-4 border rounded-lg bg-gray-50">
                    <img 
                      src={logoUrl} 
                      alt="Company Logo" 
                      className="max-h-16 max-w-full object-contain"
                    />
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Input
                    type="url"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="flex-1"
                  />
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'logo');
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploadingLogo}
                      asChild
                    >
                      <span>
                        {uploadingLogo ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                      </span>
                    </Button>
                  </label>
                </div>
              </div>
            </div>

            {/* Favicon Upload */}
            <div>
              <Label>Favicon</Label>
              <p className="text-sm text-gray-500 mb-2">Recommended: 32x32px or 64x64px</p>
              
              <div className="space-y-3">
                {faviconUrl && (
                  <div className="p-4 border rounded-lg bg-gray-50 flex justify-center">
                    <img 
                      src={faviconUrl} 
                      alt="Favicon" 
                      className="h-8 w-8 object-contain"
                    />
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Input
                    type="url"
                    value={faviconUrl}
                    onChange={(e) => setFaviconUrl(e.target.value)}
                    placeholder="https://example.com/favicon.ico"
                    className="flex-1"
                  />
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*,.ico"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, 'favicon');
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploadingFavicon}
                      asChild
                    >
                      <span>
                        {uploadingFavicon ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                      </span>
                    </Button>
                  </label>
                </div>
              </div>
            </div>

            {/* Primary Color */}
            <div>
              <Label>Primary Color</Label>
              <p className="text-sm text-gray-500 mb-2">Used for buttons and accents</p>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-20 h-10 p-1 cursor-pointer"
                />
                <Input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  placeholder="#3B82F6"
                  className="flex-1"
                />
              </div>
            </div>

            {/* Subdomain */}
            <div>
              <Label>Custom Subdomain</Label>
              <p className="text-sm text-gray-500 mb-2">yourcompany.insperityhealth.com</p>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="yourcompany"
                  className="flex-1"
                />
                <span className="text-sm text-gray-500">.insperityhealth.com</span>
              </div>
            </div>

            {/* Tagline */}
            <div className="md:col-span-2">
              <Label>Company Tagline</Label>
              <p className="text-sm text-gray-500 mb-2">Displayed on employee portal</p>
              <Input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Your Health, Our Priority"
                maxLength={100}
              />
            </div>
          </div>

          {/* Preview */}
          <div className="mt-6 p-4 border rounded-lg bg-gray-50">
            <p className="text-sm font-medium mb-3">Preview</p>
            <div className="flex items-center gap-3">
              {faviconUrl && (
                <img src={faviconUrl} alt="Favicon" className="h-6 w-6" />
              )}
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="max-h-10" />
              ) : (
                <span className="font-bold text-lg">{employer.name}</span>
              )}
              {tagline && (
                <>
                  <span className="text-gray-400">|</span>
                  <span className="text-sm text-gray-600">{tagline}</span>
                </>
              )}
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-6 flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Branding
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}