import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle } from 'lucide-react';

interface Goal {
  id: number;
  title: string;
  completed: boolean;
}

const defaultGoals: Goal[] = [
  { id: 1, title: 'Drink 2L of water daily', completed: false },
  { id: 2, title: 'Sleep 7-8 hours each night', completed: false },
  { id: 3, title: 'Eat 3 servings of vegetables', completed: false },
  { id: 4, title: 'Walk 30 minutes a day', completed: false },
  { id: 5, title: 'Log all meals this week', completed: false }
];

export const WeeklyGoalsTracker: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>(defaultGoals);

  const toggleGoal = (id: number) => {
    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === id ? { ...goal, completed: !goal.completed } : goal
      )
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-gray-200 bg-white/70 backdrop-blur p-6 shadow space-y-4"
    >
      <h3 className="text-xl font-semibold text-gray-800">Your Weekly Health Goals</h3>
      <ul className="space-y-3">
        {goals.map((goal) => (
          <li
            key={goal.id}
            onClick={() => toggleGoal(goal.id)}
            className={`cursor-pointer flex items-center gap-3 p-3 rounded-xl border shadow-sm bg-white transition hover:bg-gray-50 ${goal.completed ? 'opacity-60' : ''}`}
          >
            {goal.completed ? (
              <CheckCircle className="text-green-500 w-5 h-5" />
            ) : (
              <Circle className="text-gray-400 w-5 h-5" />
            )}
            <p className="text-sm text-gray-800">{goal.title}</p>
          </li>
        ))}
      </ul>
    </motion.div>
  );
};