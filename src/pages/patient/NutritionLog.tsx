import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Alert from '@/components/ui/alert';

interface LogEntry {
  date: string;
  food_items: string;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  total_water_oz: number;
}

export default function NutritionLog() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('food_log').select('*').eq('patient_id', user.id).order('date', { ascending: false });
        setLogs(data || []);
      }
      setLoading(false);
    })();
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-blue-700">🍽️ My Nutrition Log</h1>

      {loading && <Alert type="info" title="Loading" message="Fetching your food entries..." />}

      {!loading && logs.length === 0 && (
        <Alert type="warning" title="No Entries Found" message="You haven't logged any meals yet. Start tracking to see your nutrition stats!" />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
        {logs.map((entry, i) => (
          <Card key={i} className="bg-white/30 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg p-5">
            <h2 className="text-sm text-gray-500 mb-1">{new Date(entry.date).toLocaleDateString()}</h2>
            <p className="text-base text-gray-800 mb-2">{entry.food_items}</p>
            <div className="text-sm grid grid-cols-2 gap-1 text-gray-700">
              <span><strong>Protein:</strong> {entry.total_protein}g</span>
              <span><strong>Carbs:</strong> {entry.total_carbs}g</span>
              <span><strong>Fat:</strong> {entry.total_fat}g</span>
              <span><strong>Water:</strong> {entry.total_water_oz}oz</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}