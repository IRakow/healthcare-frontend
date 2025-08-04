// src/pages/patient/SmartGroceryMode.tsx

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useUser } from '@/hooks/useUser';
import { fetchFromGemini } from '@/lib/ai/gemini';
import { DownloadIcon, AlertCircleIcon } from 'lucide-react';

export default function SmartGroceryMode() {
  const { user } = useUser();
  const [fridgeText, setFridgeText] = useState('');
  const [groceryList, setGroceryList] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [smartTip, setSmartTip] = useState('');

  async function generateList() {
    setLoading(true);
    const prompt = `You are a Mediterranean diet AI assistant. Based on this input: ${fridgeText}, generate a categorized grocery list in sections (🥦 Produce, 🐟 Proteins, 🥫 Pantry, 🍶 Other). Suggest at least 3 items per category. Ensure the list aligns with a healthy weekly eating plan — rich in vegetables, lean proteins, legumes, whole grains, and healthy fats — and that each item could contribute to preparing balanced Mediterranean meals. Avoid isolated snacks or ingredients without pairing potential. Suggest any items that could help complete full meals across breakfast, lunch, and dinner. 

Also, personalize the recommendations based on the user's Mediterranean health profile: age, weight, sex, and wellness goals. Make sure no ingredients violate their known allergies or stated food dislikes. Focus on helping them achieve long-term dietary success.`;
    const res = await fetchFromGemini({ prompt });
    const lines = res?.text?.split('\n').filter((l) => l.trim().length > 0) || [];
    setGroceryList(lines);

    const fiberTip = lines.some(line => line.toLowerCase().includes('lentils'))
      ? ''
      : "You're low on fiber — want to add lentils?";
    setSmartTip(fiberTip);

    setLoading(false);
  }

  function exportList() {
    const blob = new Blob([groceryList.join('\n')], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'smart-grocery-list.txt';
    link.click();
  }

  return (
    <div className="min-h-screen px-6 py-20 bg-gradient-to-br from-white via-green-50 to-lime-50">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-10"
      >
        <h1 className="text-4xl font-bold text-emerald-700 mb-2">🛒 Smart Grocery Mode</h1>
        <p className="text-gray-600 max-w-xl mx-auto">
          Describe what's in your fridge or pantry. I'll generate a smart Mediterranean-style list and connect it to your weekly meal plan.
        </p>
      </motion.div>

      <div className="max-w-2xl mx-auto mb-10">
        <div className="bg-white/70 border border-green-200 p-4 rounded-xl shadow text-sm text-gray-700">
          <h3 className="text-emerald-800 font-semibold mb-2">📋 Your Profile Snapshot</h3>
          <ul className="grid sm:grid-cols-2 gap-2">
            <li><strong>Age:</strong> 42</li>
            <li><strong>Weight:</strong> 190 lbs</li>
            <li><strong>Sex:</strong> Male</li>
            <li><strong>Goal:</strong> Lean muscle + reduced inflammation</li>
            <li><strong>Diet Plan:</strong> Mediterranean Lifestyle</li>
            <li><strong>Allergies:</strong> Shellfish, peanuts</li>
          </ul>
        </div>
      </div>

      <div className="max-w-3xl mx-auto grid gap-6">
        <Card className="bg-white/80 border-none shadow-md">
          <CardContent className="p-6 space-y-4">
            <label className="text-sm font-medium text-gray-700">What's in your fridge or pantry?</label>
            <Input
              value={fridgeText}
              onChange={(e) => setFridgeText(e.target.value)}
              placeholder="e.g., spinach, chicken, Greek yogurt, chickpeas, oats"
              className="bg-white border border-gray-300 rounded-md"
            />
            <div className="flex items-center gap-4">
              <Button onClick={generateList} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
                {loading ? 'Generating...' : 'Generate Grocery List'}
              </Button>
              <Button variant="outline" onClick={exportList} disabled={groceryList.length === 0} className="text-emerald-600 flex gap-2 items-center">
                <DownloadIcon className="w-4 h-4" /> Export
              </Button>
            </div>
            {smartTip && (
              <div className="flex items-center gap-2 mt-2 text-sm text-yellow-700 bg-yellow-100 p-2 rounded shadow-sm">
                <AlertCircleIcon className="w-4 h-4" /> {smartTip}
              </div>
            )}
          </CardContent>
        </Card>

        {groceryList.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white/90 p-6 rounded-xl shadow-lg border border-green-100"
          >
            <h2 className="text-xl font-semibold text-emerald-700 mb-4">🧺 Your Grocery List</h2>
            <ul className="space-y-2 text-gray-800 text-sm list-disc list-inside">
              {groceryList.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
            <p className="mt-6 text-xs text-gray-500 text-right italic">Synced with your meal plan for this week.</p>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500 mb-2">Need to update your goal or dietary plan?</p>
              <Button
                onClick={async () => {
                const choice = prompt(`Which goal would you like to focus on?
1) Gain lean muscle
2) Improve heart health
3) Lose belly fat`, '1');
                const selectedGoal =
                  choice === '1' ? 'gain lean muscle' :
                  choice === '2' ? 'improve heart health' :
                  choice === '3' ? 'lose belly fat' : '';

                if (!selectedGoal) return;

                const res = await fetchFromGemini({
                  prompt: `Based on the user's goal to ${selectedGoal}, adjust their grocery shopping categories accordingly. Recommend additions or substitutions under 🥦 Produce, 🐟 Proteins, 🥫 Pantry, 🍶 Other to support this objective. Provide detailed yet encouraging reasoning for each suggestion.`
                });

                alert(res?.text || 'Rachel could not process your request.');
              }}
                className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded-full shadow"
              >
                🎯 Adjust Goals with Rachel
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}