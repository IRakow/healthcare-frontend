import { useEffect, useState } from 'react';
import { getPatientTimelineData, TimelineItem } from '@/services/timelineService';
import { useUser } from '@/hooks/useUser';
import { Card } from '@/components/ui/card';

export default function TimelineView() {
  const { user } = useUser();
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    getPatientTimelineData(user.id).then((data) => {
      setTimeline(data);
      setLoading(false);
    });
  }, [user]);

  if (loading) return <p className="text-gray-500 text-sm italic">Loading timeline...</p>;

  if (timeline.length === 0)
    return <p className="text-sm text-muted-foreground italic">No timeline entries found.</p>;

  return (
    <div className="space-y-4">
      {timeline.map((item) => (
        <Card key={item.id} className="p-4 bg-white/90 border border-gray-100 shadow-md rounded-xl">
          <p className="text-xs text-gray-500 mb-1">{new Date(item.created_at).toLocaleString()}</p>
          <h4 className="font-semibold text-gray-800 text-sm">{item.label}</h4>
          <p className="text-sm text-muted-foreground">{JSON.stringify(item.data)}</p>
        </Card>
      ))}
    </div>
  );
}
