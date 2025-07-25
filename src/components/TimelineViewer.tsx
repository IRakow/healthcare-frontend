import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { Spinner } from '@/components/ui/spinner';
import { Clock } from 'lucide-react';

const typeIcons = {
  visit: '🩺',
  ai: '🧠',
  upload: '📄',
  update: '✍️',
  vitals: '💓',
  lab: '🧪',
  med: '💊',
};

interface TimelineEvent {
  id: string;
  patient_id: string;
  type: keyof typeof typeIcons;
  label: string;
  data: any;
  created_at: string;
}

export function TimelineViewer({ patientId }: { patientId: string }) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, [patientId]);

  async function loadEvents() {
    try {
      const { data } = await supabase
        .from('patient_timeline_events')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(50); // Limit to most recent 50 events
      
      setEvents(data || []);
    } catch (error) {
      console.error('Error loading timeline:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="lg" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No timeline events yet</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event, i) => (
        <Card key={event.id || i} className="p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">{typeIcons[event.type] || '📌'}</span>
            <div className="flex-1">
              <h3 className="font-medium">{event.label}</h3>
              <p className="text-xs text-gray-500 mt-1">
                {format(new Date(event.created_at), 'MMM d, yyyy • h:mm a')}
              </p>
              {event.data && (
                <div className="mt-3 bg-gray-50 rounded-lg p-3">
                  <pre className="text-xs text-gray-700 whitespace-pre-wrap overflow-x-auto">
                    {JSON.stringify(event.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// Compact version without data preview
export function CompactTimelineViewer({ patientId }: { patientId: string }) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('patient_timeline_events')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(10);
      setEvents(data || []);
      setLoading(false);
    })();
  }, [patientId]);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-2">
      {events.map((event, i) => (
        <div key={event.id || i} className="flex items-center gap-2 py-2 border-b last:border-0">
          <span>{typeIcons[event.type] || '📌'}</span>
          <div className="flex-1">
            <p className="text-sm font-medium">{event.label}</p>
            <p className="text-xs text-gray-500">
              {format(new Date(event.created_at), 'MMM d, h:mm a')}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}