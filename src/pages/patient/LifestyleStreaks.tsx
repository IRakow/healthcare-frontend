import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';

interface StreakData {
  sleep: number;
  protein: number;
  hydration: number;
}

export default function LifestyleStreaks() {
  const [streaks, setStreaks] = useState<StreakData | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [food, wear] = await Promise.all([
        supabase.from('food_log').select('*').eq('patient_id', user.id).gte('date', get7DaysAgo()),
        supabase.from('wearable_logs').select('*').eq('patient_id', user.id).gte('date', get7DaysAgo())
      ]);

      const sleep = wear.data?.filter((w: any) => w.sleep_hours >= 7).length || 0;
      const protein = food.data?.filter((f: any) => f.total_protein >= 30).length || 0;
      const hydration = food.data?.filter((f: any) => f.total_water_oz >= 64).length || 0;

      setStreaks({ sleep, protein, hydration });
    })();
  }, []);

  function get7DaysAgo() {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return d.toISOString().split('T')[0];
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-blue-700">🔥 Lifestyle Streak Tracker</h1>
      <div className="transition-all duration-300 hover:shadow-lg hover:scale-[1.01]">
        <Card>
          <div className="p-4 space-y-2">
            <p className="text-sm">💪 Protein Days (≥ 30g): <strong>{streaks?.protein || 0}/7</strong></p>
            <p className="text-sm">💧 Hydration Days (≥ 64oz): <strong>{streaks?.hydration || 0}/7</strong></p>
            <p className="text-sm">😴 Sleep Days (≥ 7hrs): <strong>{streaks?.sleep || 0}/7</strong></p>
            <div className="mt-3 text-sm text-blue-700">
              {streaks && generateCoachMessage(streaks)}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function generateCoachMessage(data: StreakData) {
  if (data.sleep >= 6 && data.protein >= 6 && data.hydration >= 6) return '🌟 You\'re crushing it! Let\'s keep this energy all month!';
  if (data.sleep >= 4 && data.protein >= 4) return '👏 Solid week. Let\'s aim for 1 more hydration day!';
  if (data.sleep < 3 && data.protein < 3) return '⚠️ Consider adding a consistent bedtime and more protein-rich meals.';
  return '👍 You\'re on track — 1–2 small tweaks will take you to the next level.';
}