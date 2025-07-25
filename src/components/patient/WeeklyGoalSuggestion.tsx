import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface GoalSuggestion {
  focus_area: string;
  goal_description: string;
  target_value: number;
  unit: string;
}

export default function WeeklyGoalSuggestion() {
  const [suggestion, setSuggestion] = useState<GoalSuggestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);

  async function getSuggestion() {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: { session } } = await supabase.auth.getSession();
      
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/suggest-weekly-goal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ patientId: user.id })
      });

      const goal = await res.json();
      setSuggestion(goal);
    } catch (error) {
      console.error('Error getting suggestion:', error);
    } finally {
      setLoading(false);
    }
  }

  async function acceptGoal() {
    if (!suggestion) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get current week's Monday
      const today = new Date();
      const monday = new Date(today);
      monday.setDate(today.getDate() - today.getDay() + 1);
      monday.setHours(0, 0, 0, 0);

      await supabase.from('weekly_goals').insert({
        patient_id: user.id,
        week_start: monday.toISOString().split('T')[0],
        focus_area: suggestion.focus_area,
        goal_description: suggestion.goal_description,
        target_value: suggestion.target_value,
        unit: suggestion.unit
      });

      setAccepted(true);
    } catch (error) {
      console.error('Error accepting goal:', error);
    }
  }

  if (accepted) {
    return (
      <Card className="p-6 bg-green-50 border-green-200">
        <div className="text-center">
          <div className="text-4xl mb-2">✅</div>
          <h3 className="text-lg font-semibold text-green-800">Goal Set!</h3>
          <p className="text-sm text-green-600 mt-2">Track your progress throughout the week</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-4">🎯 AI Goal Suggestion</h3>
      
      {!suggestion ? (
        <div className="text-center">
          <p className="text-gray-600 mb-4">Get a personalized weekly goal based on your recent health data</p>
          <Button onClick={getSuggestion} disabled={loading}>
            {loading ? 'Analyzing your data...' : 'Get AI Suggestion'}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">
                {suggestion.focus_area === 'hydration' && '💧'}
                {suggestion.focus_area === 'sleep' && '😴'}
                {suggestion.focus_area === 'steps' && '👟'}
                {suggestion.focus_area === 'protein' && '🥩'}
                {suggestion.focus_area === 'meditation' && '🧘'}
              </span>
              <span className="font-semibold capitalize">{suggestion.focus_area}</span>
            </div>
            <p className="text-lg mb-2">{suggestion.goal_description}</p>
            <p className="text-sm text-gray-600">
              Target: {suggestion.target_value} {suggestion.unit}
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={acceptGoal} className="flex-1">
              Accept This Goal
            </Button>
            <Button onClick={getSuggestion} variant="secondary" disabled={loading}>
              Try Another
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}