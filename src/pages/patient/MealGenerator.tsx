// src/pages/patient/MealGenerator.tsx

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useUser } from '@/hooks/useUser';

export default function MealGenerator() {
  const { user } = useUser();
  const [meal, setMeal] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('');
  const [loading, setLoading] = useState(false);

  async function generateMeal() {
    setLoading(true);
    const res = await fetch('/api/ai/generate-meal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user?.id, goal: selectedGoal })
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

      <div className="text-center mb-6">
        <label className="block text-sm text-gray-600 mb-2">Health Goal</label>
        <select
          value={selectedGoal}
          onChange={(e) => setSelectedGoal(e.target.value)}
          className="px-4 py-2 rounded-md border border-yellow-300 bg-white text-yellow-800 shadow"
        >
          <option value="">Choose goal</option>
          <option value="gain lean muscle">💪 Gain Lean Muscle</option>
          <option value="improve heart health">❤️ Improve Heart Health</option>
          <option value="lose belly fat">🔥 Lose Belly Fat</option>
        </select>
      </div>

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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mt-10 max-w-3xl mx-auto"
        >
          <Card className="bg-white/90 border border-yellow-200 shadow-xl">
            <CardContent className="p-6 text-gray-800 whitespace-pre-line leading-relaxed space-y-2">
              <h2 className="text-lg font-semibold text-yellow-700 mb-4">🌿 Your Personalized Plan</h2>
              {meal.split('\n').map((line, index) => (
                <motion.p
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="text-sm"
                >
                  {line}
                </motion.p>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}