// File: src/components/patient/PatientTimelineViewer.tsx

import { useEffect, useState } from 'react';
import { getPatientTimelineData, TimelineItem } from '@/services/timelineService';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useUser } from '@/hooks/useUser';
import { Loader2 } from 'lucide-react';

export default function PatientTimelineViewer() {
  const { user } = useUser();
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    const fetchData = async () => {
      const data = await getPatientTimelineData(user.id);
      setTimeline(data);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  return (
    <Card className="bg-white/80 backdrop-blur rounded-2xl shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-sky-900">🕓 Patient Timeline</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-sky-600" />
          </div>
        ) : timeline.length === 0 ? (
          <p className="text-sm text-gray-500 italic">No timeline entries found.</p>
        ) : (
          <ul className="space-y-4">
            {timeline.map((item) => (
              <li
                key={item.id}
                className="p-4 bg-white rounded-xl shadow border border-gray-200"
              >
                <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                <p className="text-xs text-gray-500">{new Date(item.created_at).toLocaleString()}</p>
                <pre className="text-xs text-muted-foreground mt-2 overflow-auto">
                  {JSON.stringify(item.data, null, 2)}
                </pre>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
