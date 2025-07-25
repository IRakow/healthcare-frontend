import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Props {
  patientId: string;
  readOnly?: boolean;
}

export default function WeeklyPlanner({ patientId, readOnly = false }: Props) {
  const [meals, setMeals] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('meal_plans')
        .select('ai_plan_text')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: true });

      const list = data?.map((m) => m.ai_plan_text) || [];
      setMeals(list);
    })();
  }, [patientId]);

  async function clearPlan() {
    if (!confirm('Clear entire weekly planner?')) return;
    await supabase.from('meal_plans').delete().eq('patient_id', patientId);
    setMeals([]);
  }

  return (
    <div className="space-y-4">
      {!readOnly && (
        <div className="flex justify-end">
          <Button variant="secondary" onClick={clearPlan}>Clear Plan</Button>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {meals.length === 0 ? (
          <Card>
            <div className="p-4">
              <p className="text-sm text-gray-500">📅 No meals scheduled.</p>
            </div>
          </Card>
        ) : (
          meals.map((meal, i) => (
            <div key={i} className="transition-all duration-300 hover:shadow-lg hover:scale-[1.01]">
              <Card>
                <div className="p-4">
                  <h2 className="font-semibold text-gray-700 mb-1">Day {i + 1}</h2>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{meal}</p>
                </div>
              </Card>
            </div>
          ))
        )}
      </div>
    </div>
  );
}