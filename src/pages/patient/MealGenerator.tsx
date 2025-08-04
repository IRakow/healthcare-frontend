// src/pages/patient/MealGenerator.tsx

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useUser } from '@/hooks/useUser';

export default function MealGenerator() {
  const { user } = useUser();
  const [meal, setMeal] = useState('');
  const [loading, setLoading] = useState(false);

  async function generateMeal() {
    setLoading(true);
    const res = await fetch('/api/ai/generate-meal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user?.id })
    });
    const result = await res.json();
    setMeal(result?.meal || 'Rachel could not generate a meal plan.');
    setLoading(false);
  }

  return (
    <div className="min-h-screen px-6 py-20 bg-gradient-to-br from-white via-amber-50 to-yellow-100">
      <motion.h1
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-bold text-center text-yellow-800 mb-6"
      >
        🍽️ AI Meal Generator
      </motion.h1>
      <p className="text-center text-gray-600 max-w-xl mx-auto mb-10">
        Let Rachel build a complete Mediterranean meal plan from your ingredients, profile, and goals.
      </p>

      <div className="text-center">
        <Button
          onClick={generateMeal}
          disabled={loading}
          className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-6 py-3 rounded-full shadow-lg"
        >
          {loading ? 'Rachel is thinking...' : 'Generate Meal Plan'}
        </Button>
      </div>

      {meal && (
        <div className="mt-10 max-w-3xl mx-auto">
          <Card className="bg-white/90 border border-yellow-200 shadow-xl">
            <CardContent className="p-6 text-gray-800 whitespace-pre-line leading-relaxed">
              <h2 className="text-lg font-semibold text-yellow-700 mb-4">🌿 Your Personalized Plan</h2>
              {meal}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}