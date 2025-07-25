import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';

interface WeeklyGoal {
  id: string;
  focus_area: string;
  goal_description: string;
  target_value: number;
  current_value: number;
  unit: string;
  completed: boolean;
}

export default function CurrentWeeklyGoal() {
  const [goal, setGoal] = useState<WeeklyGoal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCurrentGoal();
  }, []);

  async function loadCurrentGoal() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get current week's Monday
      const today = new Date();
      const monday = new Date(today);
      monday.setDate(today.getDate() - today.getDay() + 1);
      monday.setHours(0, 0, 0, 0);

      const { data } = await supabase
        .from('weekly_goals')
        .select('*')
        .eq('patient_id', user.id)
        .eq('week_start', monday.toISOString().split('T')[0])
        .single();

      setGoal(data);
    } catch (error) {
      console.error('Error loading goal:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateProgress(increment: number) {
    if (!goal) return;

    const newValue = Math.min(goal.current_value + increment, goal.target_value);
    const completed = newValue >= goal.target_value;

    const { error } = await supabase
      .from('weekly_goals')
      .update({ 
        current_value: newValue,
        completed 
      })
      .eq('id', goal.id);

    if (!error) {
      setGoal({ ...goal, current_value: newValue, completed });
    }
  }

  if (loading) return <div className="animate-pulse h-32 bg-gray-100 rounded-lg" />;
  if (!goal) return null;

  const progress = (goal.current_value / goal.target_value) * 100;

  return (
    <Card title="🌟 This Week's Goal">
      <p className="text-sm text-gray-700">{goal.goal_description}</p>
      <Progress value={progress} className="my-3" />
      <p className="text-xs mt-1">{goal.current_value} / {goal.target_value} {goal.unit}</p>
      
      {!goal.completed && (
        <div className="flex gap-2 mt-4">
          <Button 
            size="sm" 
            variant="secondary"
            onClick={() => updateProgress(goal.focus_area === 'hydration' ? 8 : 1)}
          >
            +{goal.focus_area === 'hydration' ? '8' : '1'} {goal.unit}
          </Button>
        </div>
      )}
      
      {goal.completed && (
        <p className="text-green-600 text-sm font-semibold mt-3">✅ Goal Complete!</p>
      )}
    </Card>
  );
}