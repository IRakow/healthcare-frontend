import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/card';

export default function MeditationHistory() {
  const [logs, setLogs] = useState([]);

  const streak = getStreakFromLogs(logs);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('meditation_logs').select('*').eq('user_id', user.id).order('started_at', { ascending: false });
      setLogs(data || []);
    })();
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">🧘‍♂️ My Meditation History</h1>
      <p className="text-blue-600 text-sm">🟢 Current Streak: {streak} days</p>
      {logs.map((l, i) => (
        <Card key={i} title={`${l.type.toUpperCase()} – ${new Date(l.started_at).toLocaleDateString()}`}>
          <p className="text-sm">Duration: {l.duration_minutes} min</p>
          <p className="text-sm">Completed: {l.completed_at ? '✅' : '⏳ Incomplete'}</p>
        </Card>
      ))}
    </div>
  );
}