import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

export default function EmployerBranding() {
  const [form, setForm] = useState({
    primary_color: '#3B82F6',
    assistant_voice: 'Rachel',
    tagline: '',
    logo_url: '',
    favicon_url: '',
    invoice_header: '',
    invoice_footer: '',
    notification_sender_name: 'Insperity Health'
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmployerData();
  }, []);

  async function loadEmployerData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: employer } = await supabase
        .from('employers')
        .select('*')
        .eq('owner_id', user.id)
        .maybeSingle();
      
      if (employer) {
        setForm({
          primary_color: employer.primary_color || '#3B82F6',
          assistant_voice: employer.voice_profile || 'Rachel',
          tagline: employer.tagline || '',
          logo_url: employer.logo_url || '',
          favicon_url: employer.favicon_url || '',
          invoice_header: employer.invoice_header || '',
          invoice_footer: employer.invoice_footer || '',
          notification_sender_name: employer.notification_sender_name || 'Insperity Health'
        });
      }
    } catch (error) {
      console.error('Error loading employer data:', error);
    } finally {
      setLoading(false);
    }
  }

  function update(key: string, val: any) {
    setForm({ ...form, [key]: val });
  }

  async function uploadAndSave() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data: employer } = await supabase.from('employers').select('id').eq('owner_id', user.id).maybeSingle();
    if (!employer) return;

    if (logoFile) {
      const name = `${Date.now()}-${logoFile.name}`;
      await supabase.storage.from('branding').upload(name, logoFile, { upsert: true });
      const { data: { publicUrl } } = supabase.storage.from('branding').getPublicUrl(name);
      form.logo_url = publicUrl;
    }

    if (faviconFile) {
      const name = `${Date.now()}-${faviconFile.name}`;
      await supabase.storage.from('branding').upload(name, faviconFile, { upsert: true });
      const { data: { publicUrl } } = supabase.storage.from('branding').getPublicUrl(name);
      form.favicon_url = publicUrl;
    }

    await supabase.from('employers').update(form).eq('id', employer.id);
    alert('Branding saved!');
  }

  if (loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="text-center py-8">Loading branding settings...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Branding Configuration</h1>

      <Card title="Color & Tagline">
        <Input label="Primary Color" type="color" value={form.primary_color} onChange={(e: React.ChangeEvent<HTMLInputElement>) => update('primary_color', e.target.value)} />
        <Input label="Tagline" value={form.tagline} onChange={(e: React.ChangeEvent<HTMLInputElement>) => update('tagline', e.target.value)} />
      </Card>

      <Card title="Logo">
        <input type="file" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLogoFile(e.target.files?.[0] || null)} />
      </Card>

      <Card title="Favicon">
        <input type="file" accept="image/x-icon,image/png" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFaviconFile(e.target.files?.[0] || null)} />
      </Card>

      <Card title="Assistant Voice">
        <select value={form.assistant_voice} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => update('assistant_voice', e.target.value)} className="w-full p-2 border rounded text-sm">
          <option value="Rachel">Rachel</option>
          <option value="Bella">Bella</option>
          <option value="Adam">Adam</option>
        </select>
      </Card>

      <Card title="Invoice Customization">
        <div className="space-y-4">
          <div>
            <Input
              label="Invoice Header Text"
              value={form.invoice_header}
              onChange={(e) => update('invoice_header', e.target.value)}
              placeholder="e.g. Insperity Health – Employee Wellness Platform"
            />
          </div>
          
          <div>
            <Textarea
              label="Invoice Footer Text"
              rows={4}
              value={form.invoice_footer}
              onChange={(e) => update('invoice_footer', e.target.value)}
              placeholder="e.g. Powered by Insperity AI. For questions, contact billing@yourcompany.com"
            />
          </div>
        </div>
      </Card>

      <Card title="Notification Settings">
        <div className="space-y-4">
          <div>
            <Input
              label="Notification Sender Name"
              value={form.notification_sender_name}
              onChange={(e) => update('notification_sender_name', e.target.value)}
              placeholder="e.g. Acme Health Team"
            />
            <p className="text-xs text-gray-500 mt-1">
              This name will appear as the sender in emails, SMS messages, and notifications sent to your employees
            </p>
          </div>
        </div>
      </Card>

      <div className="text-right">
        <Button onClick={uploadAndSave}>Save</Button>
      </div>
    </div>
  );
}