// File: src/components/patient/TrendChartPanel.tsx

import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';

interface VitalsData {
  date: string;
  hydration?: number;
  sleep?: number;
  protein?: number;
}

interface TrendChartPanelProps {
  vitals: VitalsData[];
}

export const TrendChartPanel: React.FC<TrendChartPanelProps> = ({ vitals }) => {
  const formattedData = vitals.map((v) => ({
    ...v,
    date: new Date(v.date).toLocaleDateString()
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full h-[350px]"
    >
      <Card className="glass-card h-full">
        <CardContent className="h-full p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Vital Trends (Past 30 Days)</h2>
          <ResponsiveContainer width="100%" height="85%">
            <LineChart data={formattedData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fill: '#64748b' }} />
              <YAxis tick={{ fill: '#64748b' }} />
              <Tooltip contentStyle={{ backgroundColor: 'white', borderRadius: 8 }} />
              <Line type="monotone" dataKey="hydration" stroke="#06b6d4" strokeWidth={2} name="Hydration" />
              <Line type="monotone" dataKey="sleep" stroke="#8b5cf6" strokeWidth={2} name="Sleep" />
              <Line type="monotone" dataKey="protein" stroke="#10b981" strokeWidth={2} name="Protein" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
};