import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function VisitReviewQueue() {
  const [visits, setVisits] = useState([]);

  useEffect(() => {
    (async () => {
      const user = supabase.auth.user();

      const { data: appts } = await supabase
        .from('appointments')
        .select('*')
        .eq('provider_id', user.id)
        .eq('status', 'complete')
        .order('date', { descending: true });

      const { data: notes } = await supabase
        .from('patient_timeline_events')
        .select('appointment_id')
        .eq('type', 'visit')
        .like('label', '%SOAP Note%');

      const withNoteIds = new Set(notes.map((n) => n.appointment_id));
      const reviewList = appts.map((a) => ({
        ...a,
        reviewed: withNoteIds.has(a.id),
      }));

      setVisits(reviewList);
    })();
  }, []);

  return (
    <div className="p-6 max-w-screen-lg mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-blue-700">🗂 Visit Review Queue</h1>

      {visits.map((v, i) => (
        <Card key={i} title={`${v.date} at ${v.time} — ${v.reason}`}>
          <p className="text-sm text-gray-700">Patient ID: {v.patient_id}</p>
          <p className="text-sm">Status: {v.reviewed ? '✅ Reviewed' : '⚠️ Needs Review'}</p>
          <div className="flex gap-2 mt-3">
            <Button onClick={() => window.location.href = `/provider/patient/${v.patient_id}`}>View Patient</Button>
            {!v.reviewed && (
              <Button variant="secondary" onClick={() => alert('Send SOAP Reminder or Generate Now')}>Resolve</Button>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}