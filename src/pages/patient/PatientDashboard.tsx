// File: src/pages/patient/PatientDashboard.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  CalendarCheck2,
  ClipboardList,
  BrainCog,
  HeartPulse,
  Stethoscope,
  FileHeart
} from 'lucide-react';

const features = [
  {
    label: 'Appointments',
    description: 'Book or view upcoming appointments with ease.',
    icon: <CalendarCheck2 className="w-5 h-5 text-sky-700" />,
    path: '/patient/appointments'
  },
  {
    label: 'Timeline',
    description: 'Review your recent health activities and system logs.',
    icon: <ClipboardList className="w-5 h-5 text-sky-700" />,
    path: '/patient/timeline'
  },
  {
    label: 'Meditation',
    description: 'Start a guided meditation tailored to your preferences.',
    icon: <BrainCog className="w-5 h-5 text-sky-700" />,
    path: '/patient/meditate'
  },
  {
    label: 'Allergies',
    description: 'View or manage your allergy information.',
    icon: <HeartPulse className="w-5 h-5 text-sky-700" />,
    path: '/patient/allergies'
  },
  {
    label: 'Health Records',
    description: 'Access your uploaded documents and test results.',
    icon: <FileHeart className="w-5 h-5 text-sky-700" />,
    path: '/patient/documents'
  },
  {
    label: 'Consultations',
    description: 'Join or review past telemedicine visits.',
    icon: <Stethoscope className="w-5 h-5 text-sky-700" />,
    path: '/patient/calendar'
  }
];

export default function PatientDashboard() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-6xl mx-auto p-6 space-y-8"
    >
      <h1 className="text-3xl font-bold text-sky-900">🌟 Welcome to Your Dashboard</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <motion.div
            key={feature.label}
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <Card
              onClick={() => navigate(feature.path)}
              className="cursor-pointer bg-white/80 backdrop-blur-lg border border-white/20 rounded-2xl shadow hover:shadow-xl transition"
            >
              <CardHeader className="flex items-center space-x-3">
                <div className="bg-sky-100 p-2 rounded-full">
                  {feature.icon}
                </div>
                <CardTitle className="text-sky-900 text-lg font-semibold">{feature.label}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 pt-0">
                {feature.description}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="text-center pt-4">
        <Button
          onClick={() => navigate('/patient/health-dashboard')}
          className="bg-sky-600 hover:bg-sky-700 text-white px-6 py-2 rounded-xl"
        >
          Go to Full Health Dashboard
        </Button>
      </div>
    </motion.div>
  );
}
