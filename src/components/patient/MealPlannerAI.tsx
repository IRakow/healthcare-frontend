import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { fetchWeeklyMealPlan, generateWeeklyMealPlan } from '@/lib/api/fetchWeeklyMealPlan';

interface Meal {
  id: number;
  title: string;
  calories: number;
  protein: number;
  ingredients: string[];
  day: string;
  mealType: 'breakfast' | 'lunch' | 'dinner';
}

const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const MealPlannerAI: React.FC = () => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(false);
  const { userId } = useUser();

  const fetchPlan = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const mealPlans = await fetchWeeklyMealPlan(userId);
      
      // Transform API data to component format
      const transformedMeals: Meal[] = mealPlans.flatMap((plan, dayIndex) => {
        const day = weekDays[dayIndex] || plan.day;
        return [
          {
            id: dayIndex * 3 + 1,
            title: plan.breakfast.title,
            calories: plan.breakfast.calories,
            protein: plan.breakfast.protein,
            ingredients: plan.breakfast.ingredients,
            day,
            mealType: 'breakfast'
          },
          {
            id: dayIndex * 3 + 2,
            title: plan.lunch.title,
            calories: plan.lunch.calories,
            protein: plan.lunch.protein,
            ingredients: plan.lunch.ingredients,
            day,
            mealType: 'lunch'
          },
          {
            id: dayIndex * 3 + 3,
            title: plan.dinner.title,
            calories: plan.dinner.calories,
            protein: plan.dinner.protein,
            ingredients: plan.dinner.ingredients,
            day,
            mealType: 'dinner'
          }
        ];
      });
      
      setMeals(transformedMeals);
    } catch (error) {
      console.error('Failed to fetch meal plan:', error);
      // Fallback to generated plan
      generatePlan();
    } finally {
      setLoading(false);
    }
  };

  const generatePlan = async () => {
    setLoading(true);
    try {
      if (userId) {
        // Try to generate via API
        const preferences = {
          goal: 'maintain', // This should come from user preferences
          diet: 'Mediterranean',
          allergies: ''
        };
        
        const generatedPlans = await generateWeeklyMealPlan(userId, preferences);
        // Transform and set meals similar to fetchPlan
        return;
      }
    } catch (error) {
      console.error('Failed to generate meal plan:', error);
    }
    
    // Fallback to mock data
    const generated: Meal[] = weekDays.flatMap((day, i) => [
      {
        id: i * 3 + 1,
        title: `Mediterranean Veggie Bowl`,
        calories: 520,
        protein: 22,
        ingredients: ['Quinoa', 'Chickpeas', 'Feta', 'Cucumber'],
        day,
        mealType: 'lunch' as const
      },
      {
        id: i * 3 + 2,
        title: `Grilled Salmon + Greens`,
        calories: 480,
        protein: 35,
        ingredients: ['Salmon', 'Spinach', 'Olive Oil'],
        day,
        mealType: 'dinner' as const
      },
      {
        id: i * 3 + 3,
        title: `Greek Yogurt + Berries`,
        calories: 300,
        protein: 20,
        ingredients: ['Greek Yogurt', 'Blueberries', 'Honey'],
        day,
        mealType: 'breakfast' as const
      }
    ]);
    setMeals(generated);
    setLoading(false);
  };

  useEffect(() => {
    fetchPlan();
  }, [userId]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-gray-200 bg-white/70 backdrop-blur p-6 shadow space-y-6"
    >
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-800">Weekly Meal Planner</h3>
        <Button onClick={generatePlan} variant="secondary" disabled={loading}>
          <Sparkles className="w-4 h-4 mr-1" /> Regenerate Plan
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Generating Mediterranean meals tailored to your health plan...</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {meals.map((meal) => (
            <div key={meal.id} className="bg-white p-4 rounded-xl border shadow-sm">
              <p className="text-sm text-gray-800 font-semibold">{meal.day}: {meal.title}</p>
              <p className="text-xs text-muted-foreground mt-1">Calories: {meal.calories} • Protein: {meal.protein}g</p>
              <p className="text-xs text-gray-600 mt-1">Ingredients: {meal.ingredients.join(', ')}</p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};