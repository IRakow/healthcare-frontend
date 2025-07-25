import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';

interface MealEntry {
  date: string;
  food_items: string;
  total_protein: number;
  total_fat: number;
  total_carbs: number;
}

export default function MealQualityFeedback() {
  const [entries, setEntries] = useState<MealEntry[]>([]);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data } = await supabase
        .from('food_log')
        .select('*')
        .eq('patient_id', user.id)
        .order('date', { ascending: false })
        .limit(7);

      setEntries(data || []);
    })();
  }, []);

  function assess(meal: MealEntry) {
    let score = 0;
    if (meal.total_protein >= 20) score += 1;
    if (meal.total_fat <= 20) score += 1;
    if (meal.total_carbs <= 45) score += 1;
    if ((meal.food_items || '').toLowerCase().includes('olive')) score += 1;
    return score;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-blue-700">🍽️ Meal Quality Feedback</h1>
      {entries.length === 0 ? (
        <Card>
          <div className="p-4">
            <p className="text-sm text-gray-500">🍽 No meals logged yet this week. Log a meal to get AI feedback!</p>
          </div>
        </Card>
      ) : (
        entries.map((meal, i) => {
          const score = assess(meal);
          return (
            <div key={i} className="transition-all duration-300 hover:shadow-lg hover:scale-[1.01]">
              <Card>
                <div className="p-4">
                  <h2 className="text-sm text-gray-500">{meal.date}</h2>
                  <p className="text-sm">Meal: {meal.food_items}</p>
                  <p className="text-sm">Score: <span className={score >= 3 ? 'text-green-600' : 'text-yellow-600'}>{score}/4</span></p>
                  <p className="text-xs text-blue-700 mt-2">
                    {score === 4 && '🌿 Excellent Mediterranean choice!'}
                    {score === 3 && '👍 Solid meal — consider more greens or lean proteins.'}
                    {score === 2 && '⚠️ Add vegetables or balance macros for better alignment.'}
                    {score <= 1 && '🚫 Not compliant — reduce processed ingredients and increase whole foods.'}
                  </p>
                </div>
              </Card>
            </div>
          );
        })
      )}
    </div>
  );
}