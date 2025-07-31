// File: src/pages/patient/PatientDashboardSimple.tsx

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import PatientLayoutSimple from '@/components/layout/PatientLayoutSimple';
import { Stethoscope, Calendar, Bot, MessageSquare, Pill, Apple, FileText } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';

export default function PatientDashboardSimple() {
  const [tab, setTab] = useState('overview');
  const stats = {
    heartRate: '72 bpm',
    sleep: '7.5 hrs',
    protein: '65g',
    hydration: '64 oz',
    steps: '8,432',
    aiLogs: '3'
  };

  return (
    <PatientLayoutSimple>
      <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">Welcome Back</h1>
          <p className="text-muted-foreground text-sm md:text-base">Your personalized health dashboard</p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          <StatCard label="Heart Rate" value={stats.heartRate} icon={<Stethoscope className="w-4 h-4" />} description="Resting" />
          <StatCard label="Sleep" value={stats.sleep} icon={<Calendar className="w-4 h-4" />} description="Last Night" />
          <StatCard label="Protein" value={stats.protein} icon={<Apple className="w-4 h-4" />} description="Today" />
          <StatCard label="Hydration" value={stats.hydration} icon={<Bot className="w-4 h-4" />} description="Goal: 80oz" />
          <StatCard label="Steps" value={stats.steps} icon={<Calendar className="w-4 h-4" />} description="So far" />
          <StatCard label="AI Logs" value={stats.aiLogs} icon={<Bot className="w-4 h-4" />} description="Today" />
        </motion.div>

        <Tabs value={tab} onValueChange={setTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="medications">Medications</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Upcoming Appointments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Annual Checkup</p>
                      <p className="text-sm text-gray-500">Dr. Smith - Primary Care</p>
                    </div>
                    <p className="text-sm font-medium">Dec 15, 2:00 PM</p>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Lab Work</p>
                      <p className="text-sm text-gray-500">Quest Diagnostics</p>
                    </div>
                    <p className="text-sm font-medium">Dec 20, 9:00 AM</p>
                  </div>
                </div>
                <Button className="w-full mt-4" variant="outline">View All Appointments</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PatientLayoutSimple>
  );
}