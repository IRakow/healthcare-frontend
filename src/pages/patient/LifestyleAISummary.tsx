// src/pages/patient/LifestyleAISummary.tsx

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { fetchFromGemini } from '@/lib/ai/gemini';
import {
  DropletIcon,
  FlameIcon,
  FootprintsIcon,
  BedDoubleIcon,
  BotIcon
} from 'lucide-react';

const mockData = {
  hydration: 6.7,
  protein: 102,
  steps: 7250,
  sleep: 7.4
};

export default function LifestyleAISummary() {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  async function generateSummary() {
    setLoading(true);
    const prompt = `You're an AI health coach. Summarize this patient's week:
    Hydration: ${mockData.hydration} avg cups/day
    Protein: ${mockData.protein} g/day
    Steps: ${mockData.steps} per day
    Sleep: ${mockData.sleep} hours/night

    Give a concise, motivating summary with one area to improve next week.`;
    const res = await fetchFromGemini({ prompt });
    setSummary(res?.text || '');
    setLoading(false);
  }

  return (
    <div className="min-h-screen px-6 py-20 bg-gradient-to-br from-white via-amber-50 to-yellow-100">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold text-yellow-800 text-center mb-4"
      >
        🧠 AI Lifestyle Summary
      </motion.h1>
      <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
        Here's a breakdown of your week in hydration, nutrition, sleep, and movement — all reviewed by Rachel.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto mb-10">
        <Card className="bg-white/90">
          <CardContent className="p-4 text-center">
            <DropletIcon className="w-6 h-6 mx-auto text-cyan-600 mb-2" />
            <div className="text-xs text-gray-500">Hydration</div>
            <div className="text-xl font-semibold text-gray-800">{mockData.hydration} cups</div>
          </CardContent>
        </Card>
        <Card className="bg-white/90">
          <CardContent className="p-4 text-center">
            <FlameIcon className="w-6 h-6 mx-auto text-orange-500 mb-2" />
            <div className="text-xs text-gray-500">Protein</div>
            <div className="text-xl font-semibold text-gray-800">{mockData.protein} g</div>
          </CardContent>
        </Card>
        <Card className="bg-white/90">
          <CardContent className="p-4 text-center">
            <FootprintsIcon className="w-6 h-6 mx-auto text-emerald-600 mb-2" />
            <div className="text-xs text-gray-500">Steps</div>
            <div className="text-xl font-semibold text-gray-800">{mockData.steps.toLocaleString()} steps</div>
          </CardContent>
        </Card>
        <Card className="bg-white/90">
          <CardContent className="p-4 text-center">
            <BedDoubleIcon className="w-6 h-6 mx-auto text-purple-500 mb-2" />
            <div className="text-xs text-gray-500">Sleep</div>
            <div className="text-xl font-semibold text-gray-800">{mockData.sleep} hrs</div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <Button
          onClick={generateSummary}
          className="bg-yellow-700 hover:bg-yellow-800 text-white font-semibold px-6 py-3 rounded-full shadow flex gap-2 items-center justify-center"
        >
          <BotIcon className="w-4 h-4" /> {loading ? 'Generating...' : 'Generate AI Summary'}
        </Button>
      </div>

      {summary && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mt-8 max-w-3xl mx-auto text-left bg-white/90 p-6 rounded-xl shadow border border-yellow-200 text-sm text-yellow-800"
        >
          {summary}
        </motion.div>
      )}
    </div>
  );
}