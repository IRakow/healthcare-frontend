import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/card';

export default function SOAPNotes() {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('patient_timeline_events')
        .select('*')
        .eq('type', 'visit')
        .like('label', '%SOAP Note%')
        .order('created_at', { descending: true });
      setNotes(data || []);
    })();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">🧾 SOAP Notes</h1>
      {notes.map((n, i) => (
        <Card key={i} title={n.label}>
          <pre className="text-sm whitespace-pre-wrap">{n.data?.soap}</pre>
        </Card>
      ))}
    </div>
  );
}