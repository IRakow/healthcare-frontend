// src/pages/patient/MealPlanner.tsx

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/hooks/useUser';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const CATEGORIES = ['🥦 Produce', '🐟 Proteins', '🥫 Pantry', '🍶 Other'];

export default function MealPlanner() {
  const { user } = useUser();
  const [items, setItems] = useState<Record<string, string[]>>({});

  useEffect(() => {
    async function loadItems() {
      const { data } = await supabase
        .from('meal_planner_items')
        .select('item')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (data) {
        const grouped: Record<string, string[]> = {
          '🥦 Produce': [],
          '🐟 Proteins': [],
          '🥫 Pantry': [],
          '🍶 Other': []
        };
        for (const entry of data) {
          const category = CATEGORIES.find(c => entry.item.includes(c)) || '🍶 Other';
          grouped[category].push(entry.item.replace(`${category}: `, ''));
        }
        setItems(grouped);
      }
    }
    if (user?.id) loadItems();
  }, [user]);

  return (
    <div className="min-h-screen px-6 py-20 bg-gradient-to-br from-white via-blue-50 to-indigo-50">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-bold text-indigo-800 text-center mb-6"
      >
        🥗 Weekly Meal Planner
      </motion.h1>

      <Tabs defaultValue="🥦 Produce" className="max-w-3xl mx-auto">
        <TabsList className="grid grid-cols-4 bg-white/90 rounded-xl shadow border border-indigo-100 mb-6">
          {CATEGORIES.map((cat) => (
            <TabsTrigger key={cat} value={cat} className="text-indigo-700">
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>

        {CATEGORIES.map((cat) => (
          <TabsContent key={cat} value={cat}>
            <div className="grid gap-4">
              {items[cat]?.length > 0 ? (
                items[cat].map((item, idx) => (
                  <Card key={idx} className="bg-white/90 border border-indigo-100 shadow">
                    <CardContent className="p-4 text-indigo-800 font-medium">
                      {item}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <p className="text-sm text-gray-500">No items yet in this category.</p>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <div className="mt-10 text-center">
        <p className="text-sm text-gray-600 mb-3">Want Rachel to generate a full meal idea from your ingredients?</p>
        <button
          onClick={async () => {
            const res = await fetch('/api/ai/generate-meal', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: user?.id })
            });
            const result = await res.json();
            alert(result?.meal || 'Rachel could not generate a meal plan.');
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-full shadow"
        >
          🍽️ Generate Meal Plan with Rachel
        </button>
      </div>
    </div>
  );
}