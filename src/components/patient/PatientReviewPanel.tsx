import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';

interface ReviewData {
  days: number;
  missedProtein: number;
  lowSleep: number;
}

export default function PatientReviewPanel({ patientId }: { patientId: string }) {
  const [data, setData] = useState<ReviewData | null>(null);

  useEffect(() => {
    (async () => {
      const { data: food } = await supabase.from('food_log').select('*').eq('patient_id', patientId).gte('date', getLastMonday());
      const { data: wearable } = await supabase.from('wearable_logs').select('*').eq('patient_id', patientId).gte('date', getLastMonday());

      const days = food?.length || 0;
      const missedProtein = food?.filter((f: any) => f.total_protein < 30).length || 0;
      const lowSleep = wearable?.filter((w: any) => w.sleep_hours < 6).length || 0;

      setData({ days, missedProtein, lowSleep });
    })();
  }, [patientId]);

  function getLastMonday() {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff)).toISOString().split('T')[0];
  }

  return (
    <div className="p-4 space-y-4 max-w-xl mx-auto">
      <h2 className="text-xl font-semibold text-blue-700">🧠 AI Lifestyle Summary (Last 7 Days)</h2>
      <Card>
        <div className="p-4 space-y-2">
          <p className="text-sm">🍽 Meals Logged: {data?.days || 0}</p>
          <p className="text-sm">⚠️ Protein < 30g: {data?.missedProtein || 0} day(s)</p>
          <p className="text-sm">😴 Sleep < 6 hrs: {data?.lowSleep || 0} day(s)</p>
          <p className="text-sm text-blue-600 mt-2">{generateInsight(data)}</p>
        </div>
      </Card>
    </div>
  );
}

function generateInsight(data: ReviewData | null) {
  if (!data) return '';
  if (data.lowSleep >= 3 && data.missedProtein >= 3) return 'Patient may be in a recovery-deficit cycle. Recommend dietary protein and rest focus.';
  if (data.lowSleep >= 3) return 'Sleep appears insufficient. Recommend rest focus.';
  if (data.missedProtein >= 3) return 'Protein intake is low several days. Recommend review of meal plan.';
  return 'Patient trending positively in most areas.';
}