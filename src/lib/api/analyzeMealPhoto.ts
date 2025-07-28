import { supabase } from '@/lib/supabase';

export interface MealAnalysis {
  items: string[];
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  raw_response?: string;
}

export async function analyzeMealPhoto(base64Image: string, userId?: string): Promise<MealAnalysis> {
  const { data, error } = await supabase.functions.invoke('analyze-meal-photo', {
    body: { base64Image, userId }
  });

  if (error) {
    console.error('[analyzeMealPhoto] Error:', error);
    throw new Error('Failed to analyze meal photo');
  }

  return data.analysis;
}