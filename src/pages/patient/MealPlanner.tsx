// src/pages/patient/MealPlanner.tsx

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/hooks/useUser';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

export default function MealPlanner() {
  const { user } = useUser();
  const [items, setItems] = useState<string[]>([]);

  useEffect(() => {
    async function loadItems() {
      const { data, error } = await supabase
        .from('meal_planner_items')
        .select('item')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (data) setItems(data.map((entry: any) => entry.item));
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

      <div className="max-w-3xl mx-auto grid gap-4">
        {items.length === 0 ? (
          <p className="text-center text-gray-500 text-sm">No meal plan items yet. Accept suggestions from Rachel to begin.</p>
        ) : (
          items.map((item, index) => (
            <Card key={index} className="bg-white/90 border border-indigo-100 shadow">
              <CardContent className="p-4 text-indigo-800 font-medium">
                {item}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}