import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import Alert from '@/components/ui/alert';

interface TimelineEvent {
  id: string;
  type: string;
  label: string;
  created_at: string;
  data?: any;
}

export default function TimelineViewer({ patientId }: { patientId: string }) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('patient_timeline_events')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });
      setEvents(data || []);
      setLoading(false);
    })();
  }, [patientId]);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-blue-700">📜 Patient Timeline</h1>

      {loading && <Alert type="info" title="Loading" message="Loading timeline data..." />}

      {!loading && events.length === 0 && (
        <Alert type="warning" title="No Timeline Entries" message="No events found for this patient yet." />
      )}

      <div className="space-y-4">
        {events.map((event) => (
          <Card
            key={event.id}
            className="bg-white/30 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg p-4"
          >
            <h2 className="text-sm text-gray-500">{new Date(event.created_at).toLocaleString()}</h2>
            <p className="text-base text-gray-800 font-semibold mb-1">{event.label}</p>
            {event.data && (
              <pre className="text-xs text-gray-600 bg-white/20 rounded p-2 overflow-auto">
                {JSON.stringify(event.data, null, 2)}
              </pre>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}