// src/pages/patient/HealthHub.tsx

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import {
  FlameIcon,
  AppleIcon,
  LineChartIcon,
  BotIcon,
  ShoppingCartIcon,
  GalleryVerticalIcon
} from 'lucide-react';

const healthTools = [
  {
    label: 'Vitals & Trends',
    icon: LineChartIcon,
    href: '/patient/vitals',
    color: 'from-blue-400 to-cyan-500'
  },
  {
    label: 'Meal Log & AI Review',
    icon: AppleIcon,
    href: '/patient/nutrition',
    color: 'from-green-400 to-teal-500'
  },
  {
    label: 'Weekly Goals',
    icon: FlameIcon,
    href: '/patient/goals',
    color: 'from-orange-400 to-red-500'
  },
  {
    label: 'Smart Grocery Mode',
    icon: ShoppingCartIcon,
    href: '/patient/grocery',
    color: 'from-yellow-400 to-amber-500'
  },
  {
    label: 'Progress Photos',
    icon: GalleryVerticalIcon,
    href: '/patient/photos',
    color: 'from-purple-400 to-indigo-500'
  },
  {
    label: 'AI Lifestyle Summary',
    icon: BotIcon,
    href: '/patient/summary',
    color: 'from-rose-400 to-pink-500'
  }
];

export default function HealthHub() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="min-h-screen px-6 pt-10 pb-32 bg-gradient-to-br from-white via-blue-50 to-cyan-50">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-bold text-center mb-6 text-cyan-900 drop-shadow"
      >
        🌿 Health Hub
      </motion.h1>
      <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
        Welcome to your all-in-one lifestyle dashboard. Track your health, discover smart insights, and let Rachel help you thrive.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {healthTools.map(({ label, icon: Icon, href, color }) => (
          <motion.div
            key={label}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onMouseEnter={() => setHovered(label)}
            onMouseLeave={() => setHovered(null)}
            className="cursor-pointer"
            onClick={() => navigate(href)}
          >
            <Card className={`bg-gradient-to-br ${color} text-white shadow-xl rounded-2xl`}>
              <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-4">
                <Icon className="w-10 h-10" />
                <div className="text-lg font-semibold">{label}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}