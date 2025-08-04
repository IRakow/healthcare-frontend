// src/pages/patient/Vitals.tsx

import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { FlameIcon, DropletIcon, FootprintsIcon, BedDoubleIcon } from 'lucide-react';
import 'chart.js/auto';

const metrics = [
  {
    label: 'Hydration (cups)',
    icon: DropletIcon,
    color: 'cyan',
    key: 'hydration',
    data: [7, 8, 6, 5, 8, 7, 9]
  },
  {
    label: 'Protein (grams)',
    icon: FlameIcon,
    color: 'orange',
    key: 'protein',
    data: [90, 110, 100, 105, 95, 115, 98]
  },
  {
    label: 'Steps (k)',
    icon: FootprintsIcon,
    color: 'emerald',
    key: 'steps',
    data: [6.5, 8.2, 7.1, 5.9, 9.0, 6.8, 7.4]
  },
  {
    label: 'Sleep (hrs)',
    icon: BedDoubleIcon,
    color: 'purple',
    key: 'sleep',
    data: [7.5, 8, 6.5, 7, 7.2, 8.1, 7.8]
  }
];

export default function VitalsPage() {
  return (
    <div className="min-h-screen px-6 py-20 bg-gradient-to-br from-white via-blue-50 to-sky-100">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold text-sky-800 text-center mb-10"
      >
        📈 Vitals & Trends
      </motion.h1>

      <div className="grid gap-6 max-w-5xl mx-auto">
        {metrics.map(({ label, icon: Icon, color, data, key }) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-white/90 border border-blue-100 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Icon className={`w-5 h-5 text-${color}-600`} />
                  <h2 className="font-semibold text-gray-800">{label}</h2>
                </div>
                <Line
                  data={{
                    labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                    datasets: [
                      {
                        label,
                        data,
                        fill: false,
                        borderColor: `rgba(0,0,0,0.2)`,
                        backgroundColor: `${color}`,
                        tension: 0.3
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        display: false
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          color: '#4B5563',
                          font: { size: 12 }
                        }
                      },
                      x: {
                        ticks: {
                          color: '#6B7280',
                          font: { size: 12 }
                        }
                      }
                    }
                  }}
                />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}