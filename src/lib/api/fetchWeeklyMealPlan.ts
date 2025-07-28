import { supabase } from '@/lib/supabase';

export interface MealPlan {
  id: string;
  user_id: string;
  day: string;
  breakfast: {
    title: string;
    calories: number;
    protein: number;
    ingredients: string[];
  };
  lunch: {
    title: string;
    calories: number;
    protein: number;
    ingredients: string[];
  };
  dinner: {
    title: string;
    calories: number;
    protein: number;
    ingredients: string[];
  };
  created_at: string;
  updated_at: string;
}

export async function fetchWeeklyMealPlan(userId: string): Promise<MealPlan[]> {
  const { data, error } = await supabase
    .from('weekly_meal_plan')
    .select('*')
    .eq('user_id', userId)
    .order('day');

  if (error) {
    console.error('[fetchWeeklyMealPlan] Supabase error:', error);
    throw new Error('Failed to load meal plan');
  }

  return data || [];
}

export async function generateWeeklyMealPlan(userId: string, preferences: {
  goal: string;
  diet: string;
  allergies: string;
}): Promise<MealPlan[]> {
  const { data, error } = await supabase.functions.invoke('generate-meal-plan', {
    body: { userId, preferences }
  });

  if (error) {
    console.error('[generateWeeklyMealPlan] Error:', error);
    throw new Error('Failed to generate meal plan');
  }

  return data.mealPlan || [];
}