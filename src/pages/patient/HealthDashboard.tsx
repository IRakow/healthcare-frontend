// File: src/pages/patient/HealthDashboard.tsx

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import {
  Stethoscope,
  FileText,
  Apple,
  Droplet,
  ShieldPlus,
  ActivitySquare
} from 'lucide-react';

export default function HealthDashboard() {
  const navigate = useNavigate();

  const tiles = [
    {
      title: 'Health Records',
      icon: <FileText className="w-5 h-5 text-emerald-600" />,
      description: 'View lab results, medications, and uploads.',
      path: '/patient/records'
    },
    {
      title: 'Nutrition Log',
      icon: <Apple className="w-5 h-5 text-orange-500" />,
      description: 'Track meals with photo, voice, or manual entry.',
      path: '/patient/nutrition-log'
    },
    {
      title: 'Hydration',
      icon: <Droplet className="w-5 h-5 text-blue-400" />,
      description: 'Monitor your daily water intake and stay hydrated.',
      path: '/patient/health-dashboard#hydration'
    },
    {
      title: 'Vitals & Trends',
      icon: <ActivitySquare className="w-5 h-5 text-purple-500" />,
      description: 'Track weight, heart rate, blood pressure, and sleep.',
      path: '/patient/wearables'
    },
    {
      title: 'Wellness Goals',
      icon: <ShieldPlus className="w-5 h-5 text-pink-500" />,
      description: 'Set and review personalized weekly goals.',
      path: '/patient/goals'
    },
    {
      title: 'AI Consults',
      icon: <Stethoscope className="w-5 h-5 text-cyan-600" />,
      description: 'Review conversations and insights from your AI assistant.',
      path: '/patient/ai-history'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold text-emerald-900">🩺 Your Health Hub</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tiles.map(({ title, icon, description, path }) => (
          <Card
            key={title}
            onClick={() => navigate(path)}
            className="cursor-pointer transition hover:shadow-xl bg-white/70 backdrop-blur border border-white/20 rounded-2xl"
          >
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg text-emerald-800">
                {icon}
                <span>{title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600">
              {description}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
