// src/pages/patient/SmartGroceryMode.tsx

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useUser } from '@/hooks/useUser';
import { fetchFromGemini } from '@/lib/ai/gemini';
import { DownloadIcon, AlertCircleIcon, MicIcon } from 'lucide-react';

export default function SmartGroceryMode() {
  const { user } = useUser();
  const [fridgeText, setFridgeText] = useState('');
  const [groceryList, setGroceryList] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [smartTip, setSmartTip] = useState('');

  async function generateList() {
    setLoading(true);
    const prompt = `You are a Mediterranean diet AI assistant. Based on this input: ${fridgeText}, generate a categorized grocery list in sections (🥦 Produce, 🐟 Proteins, 🥫 Pantry, 🍶 Other). Suggest at least 3 items per category and flag any nutritional gaps.`;
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

      <div className="max-w-3xl mx-auto grid gap-6">
        <Card className="bg-white/80 border-none shadow-md">
          <CardContent className="p-6 space-y-4">
            <label className="text-sm font-medium text-gray-700">What's in your fridge or pantry?</label>
            <Input
              value={fridgeText}
              onChange={(e) => setFridgeText(e.target.value)}
              placeholder="e.g., chicken, lettuce, yogurt, black beans, granola"
              className="bg-white border border-gray-300 rounded-md"
            />
            <div className="flex items-center gap-4">
              <Button onClick={generateList} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
                {loading ? 'Generating...' : 'Generate Grocery List'}
              </Button>
              <Button variant="ghost" className="flex items-center gap-2 text-emerald-600">
                <MicIcon className="w-4 h-4" /> Voice Fill (Coming Soon)
              </Button>
            </div>
          </CardContent>
        </Card>

        {groceryList.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white/80 p-6 rounded-xl shadow-lg border border-green-100"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-emerald-700">🧺 Your Smart Grocery List</h2>
              <Button
                onClick={exportList}
                variant="outline"
                className="flex items-center gap-2 text-emerald-600 border-emerald-300 hover:bg-emerald-50"
              >
                <DownloadIcon className="w-4 h-4" /> Export List
              </Button>
            </div>
            <ul className="space-y-2 text-gray-800 text-sm list-disc list-inside">
              {groceryList.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>

            {smartTip && (
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                <AlertCircleIcon className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">{smartTip}</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}