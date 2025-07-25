import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';

export default function ProviderNotifications() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    (async () => {
      const user = supabase.auth.user();

      const { data: appts } = await supabase
        .from('appointments')
        .select('*')
        .eq('provider_id', user.id)
        .eq('status', 'pending');

      const { data: labs } = await supabase
        .from('patient_timeline_events')
        .select('*')
        .eq('type', 'lab')
        .order('created_at', { descending: true });

      const labFlags = labs.filter((l) => l.data?.abnormal);

      setItems([
        ...appts.map((a) => ({ type: 'appointment', ...a })),
        ...labFlags.map((l) => ({ type: 'lab', ...l }))
      ]);
    })();
  }, []);

  return (
    <div className="p-6 max-w-screen-lg mx-auto space-y-6">
      <h1 className="text-3xl font-bold">🔔 Provider Alerts</h1>
      {items.map((item, i) => (
        <Card key={i} title={item.type === 'appointment' ? `📅 New Appt: ${item.date}` : '⚠️ Flagged Lab'}>
          <p className="text-sm">{item.reason || item.label}</p>
        </Card>
      ))}
    </div>
  );
}