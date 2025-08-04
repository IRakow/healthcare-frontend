// src/pages/patient/WeeklyGoals.tsx

import { useState, useEffect } from 'react';
import { FlameIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { fetchFromGemini } from '@/lib/ai/gemini';

const mockGoals = [
  { label: 'Drink 8 cups of water daily', key: 'hydration', done: [true, true, false, false, true, false, true] },
  { label: 'Eat 100g of protein', key: 'protein', done: [true, false, true, true, false, false, false] },
  { label: 'Get 7+ hours of sleep', key: 'sleep', done: [true, true, true, true, true, true, true] },
  { label: 'Take a 20-minute walk', key: 'movement', done: [false, true, false, true, true, false, false] }
];

export default function WeeklyGoals() {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  async function getAISummary() {
    setLoading(true);
    const prompt = `Generate a motivational weekly health summary for a patient who completed: \n
    Hydration: ${mockGoals[0].done.filter(Boolean).length} days\n
    Protein: ${mockGoals[1].done.filter(Boolean).length} days\n
    Sleep: ${mockGoals[2].done.filter(Boolean).length} days\n
    Movement: ${mockGoals[3].done.filter(Boolean).length} days\n
    Use positive, encouraging language and suggest one improvement for next week.`;
    const res = await fetchFromGemini({ prompt });
    setSummary(res?.text || '');
    setLoading(false);
  }

  return (
    <div className="min-h-screen px-6 py-20 bg-gradient-to-br from-white via-rose-50 to-pink-50">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <h1 className="text-4xl font-bold text-rose-600 mb-2">🔥 Weekly Goals Tracker</h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          Visualize your health habits across the week. Keep your streak alive and let Rachel celebrate your wins!
        </p>
      </motion.div>

      <div className="grid gap-6 max-w-4xl mx-auto">
        {mockGoals.map((goal) => (
          <Card key={goal.key} className="bg-white/90 border border-rose-100 shadow-md">
            <CardContent className="p-4">
              <div className="text-md font-semibold text-rose-800 mb-2 flex items-center gap-2">
                <FlameIcon className="w-4 h-4 text-orange-500" /> {goal.label}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {goal.done.map((done, i) => (
                  <div
                    key={i}
                    className={`rounded-full w-8 h-8 flex items-center justify-center text-white text-xs font-bold ${
                      done ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'][i]}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Button onClick={getAISummary} className="bg-rose-600 hover:bg-rose-700 text-white font-semibold px-6 py-3 rounded-full shadow">
          {loading ? 'Generating Summary...' : 'AI Motivation Boost'}
        </Button>

        {summary && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mt-6 max-w-3xl mx-auto text-left bg-white/90 p-6 rounded-xl shadow border border-rose-100 text-sm text-rose-700"
          >
            {summary}
          </motion.div>
        )}
      </div>
    </div>
  );
}