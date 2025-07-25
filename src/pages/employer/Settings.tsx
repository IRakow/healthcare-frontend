import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

export default function EmployerSettings() {
  const [branding, setBranding] = useState({ color: '', logo_url: '', welcome_message: '' });

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('employer_branding').select('*').single();
      if (data) setBranding(data);
    })();
  }, []);

  async function saveSettings() {
    await supabase.from('employer_branding').upsert(branding);
    alert('✅ Settings saved!');
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-blue-700">⚙️ Employer Settings</h1>
      <Card>
        <label className="text-sm font-medium">Primary Color</label>
        <Input type="text" value={branding.color} onChange={e => setBranding({ ...branding, color: e.target.value })} />

        <label className="text-sm font-medium mt-4">Logo URL</label>
        <Input type="text" value={branding.logo_url} onChange={e => setBranding({ ...branding, logo_url: e.target.value })} />

        <label className="text-sm font-medium mt-4">Welcome Message</label>
        <Input type="text" value={branding.welcome_message} onChange={e => setBranding({ ...branding, welcome_message: e.target.value })} />

        <Button onClick={saveSettings} className="mt-4">Save Settings</Button>
      </Card>
    </div>
  );
}