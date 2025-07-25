import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Wearables() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    (async () => {
      const user = supabase.auth.user();
      const { data } = await supabase
        .from('wearable_logs')
        .select('*')
        .eq('patient_id', user.id)
        .order('date', { ascending: true });
      setLogs(data || []);
    })();
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-blue-700">📊 Wearables Dashboard</h1>

      <WearableChart label="Steps" data={logs} dataKey="steps" />
      <WearableChart label="Sleep (hrs)" data={logs} dataKey="sleep_hours" />
      <WearableChart label="Heart Rate (avg)" data={logs} dataKey="heart_rate" />
      <WearableChart label="HRV" data={logs} dataKey="hrv" />
      <WearableChart label="Readiness Score" data={logs} dataKey="readiness_score" />
    </div>
  );
}

function WearableChart({ label, data, dataKey }: any) {
  return (
    <Card title={label}>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey={dataKey} stroke="#3B82F6" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}