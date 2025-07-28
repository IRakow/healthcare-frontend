import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, TrendingUp, AlertCircle } from 'lucide-react';

interface Insight {
  id: number;
  type: 'tip' | 'trend' | 'alert';
  message: string;
}

export const AutoInsightsPanel: React.FC = () => {
  const insights: Insight[] = [
    {
      id: 1,
      type: 'trend',
      message: 'Your water intake has improved 30% this week. Keep it up!'
    },
    {
      id: 2,
      type: 'tip',
      message: 'Try adding more leafy greens to hit your fiber goals.'
    },
    {
      id: 3,
      type: 'alert',
      message: 'You\'ve been below your protein target for 3 days.'
    }
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'tip':
        return <Lightbulb className="w-4 h-4 text-yellow-500" />;
      case 'trend':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'alert':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-gray-200 bg-white/70 backdrop-blur p-6 shadow space-y-4"
    >
      <h3 className="text-xl font-semibold text-gray-800">AI Health Insights</h3>
      <div className="space-y-3">
        {insights.map((insight) => (
          <div key={insight.id} className="flex items-start gap-3 p-3 bg-white rounded-xl border shadow-sm">
            {getIcon(insight.type)}
            <p className="text-sm text-gray-700">{insight.message}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
};