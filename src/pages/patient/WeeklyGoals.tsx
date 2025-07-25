import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useUser } from '@/hooks/useUser';

export default function WeeklyGoals() {
  const { user } = useUser();
  const [goal, setGoal] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('weekly_goals')
        .select('*')
        .eq('patient_id', user.id)
        .order('week_start', { ascending: false })
        .limit(1)
        .single();
      setGoal(data);
      setLoading(false);
    })();
  }, [user.id]);

  if (loading) return <p className="text-center mt-8 text-sm">Loading your weekly goal...</p>;
  if (!goal) return <p className="text-center mt-8 text-sm text-gray-500">No weekly goal found yet.</p>;

  const percent = Math.min((goal.current_value / goal.target_value) * 100, 100);
  const isComplete = percent >= 100;

  return (
    <div className="p-6 max-w-xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-blue-700">🎯 My Weekly Goal</h1>
      <Card>
        <h2 className="text-lg font-semibold mb-2 text-gray-800">{goal.goal_description}</h2>
        <Progress value={percent} />
        <p className="text-sm text-gray-600 mt-2">{goal.current_value} / {goal.target_value} {goal.unit}</p>
        {isComplete && <p className="text-green-600 mt-2 text-sm">✅ Goal completed! Great job!</p>}
      </Card>
    </div>
  );
}