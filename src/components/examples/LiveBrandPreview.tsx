import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';

export default function LiveBrandPreview() {
  const [branding, setBranding] = useState<any>({});

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase.from('employers').select('*').eq('owner_id', user?.id).maybeSingle();
      setBranding(data || {});
    })();
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <h1 className="text-3xl font-bold">Branding Preview</h1>
      <Card className="p-4">
        <div className="space-y-2">
          <p><strong>Company:</strong> {branding.name}</p>
          <p><strong>Subdomain:</strong> {branding.subdomain}.yourapp.com</p>
          <p><strong>Voice:</strong> {branding.assistant_voice}</p>
          <p><strong>Color:</strong> <span style={{ background: branding.primary_color }} className="inline-block w-6 h-4 rounded-md ml-2"></span></p>
        </div>
      </Card>
    </div>
  );
}