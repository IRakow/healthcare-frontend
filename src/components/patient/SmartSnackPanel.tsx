import React from 'react';
import { motion } from 'framer-motion';

const smartSnacks = [
  { title: 'Almonds (1 oz)', macros: '164 kcal • 6g protein' },
  { title: 'Hummus + Carrot Sticks', macros: '150 kcal • 5g protein' },
  { title: 'Boiled Egg + Cucumber', macros: '140 kcal • 7g protein' },
  { title: 'Cottage Cheese + Berries', macros: '180 kcal • 12g protein' },
  { title: 'Apple + Peanut Butter (1 tbsp)', macros: '190 kcal • 4g protein' }
];

export const SmartSnackPanel: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-gray-200 bg-white/70 backdrop-blur p-6 shadow space-y-4"
    >
      <h3 className="text-xl font-semibold text-gray-800">Need a Quick Healthy Snack?</h3>
      <ul className="space-y-3">
        {smartSnacks.map((snack, i) => (
          <li key={i} className="bg-white p-3 rounded-xl border shadow-sm text-sm">
            <p className="text-gray-800 font-medium">{snack.title}</p>
            <p className="text-muted-foreground text-xs mt-1">{snack.macros}</p>
          </li>
        ))}
      </ul>
    </motion.div>
  );
};