// src/pages/patient/PatientTimeline.tsx

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TimelineEvent {
  id: string;
  type: string;
  timestamp: string;
  content: string;
  metadata?: any;
}

const eventIcons: Record<string, string> = {
  visit: '🩺',
  meal: '🍽️',
  ai: '🤖',
  vitals: '💓',
  upload: '📎'
};

const eventColors: Record<string, string> = {
  visit: 'bg-sky-100',
  meal: 'bg-emerald-100',
  ai: 'bg-violet-100',
  vitals: 'bg-yellow-100',
  upload: 'bg-slate-100'
};

export default function PatientTimeline() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    const { data, error } = await supabase.from('timeline_events').select('*').order('timestamp', { ascending: false });
    if (!error && data) setEvents(data);
    setLoading(false);
  }

  return (
    <div className="min-h-screen p-6 pb-28 bg-gradient-to-b from-white via-gray-50 to-blue-50">
      <h1 className="text-3xl font-bold tracking-tight text-center mb-6">📜 My Health Timeline</h1>

      <div className="max-w-2xl mx-auto relative border-l border-gray-300 space-y-8">
        {loading ? (
          <p className="text-center text-muted-foreground">Loading timeline...</p>
        ) : events.length === 0 ? (
          <p className="text-center text-muted-foreground">No timeline events yet.</p>
        ) : (
          events.map((event, index) => (
            <div key={event.id} className="relative pl-8">
              <div className="absolute -left-4 top-1 text-xl">
                {eventIcons[event.type] || '📌'}
              </div>
              <Card className={cn('shadow-md border-none', eventColors[event.type] || 'bg-white') + ' rounded-xl'}>
                <CardContent className="p-4 space-y-1">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold capitalize text-sm">{event.type}</h2>
                    <Badge variant="outline">{new Date(event.timestamp).toLocaleString()}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {event.content}
                  </p>
                </CardContent>
              </Card>
            </div>
          ))
        )}
      </div>
    </div>
  );
}