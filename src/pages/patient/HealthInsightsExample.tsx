import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import PatientLayout from '@/components/layout/PatientLayout';
import { WeeklyGoalsTracker } from '@/components/patient/WeeklyGoalsTracker';
import { TrendChartPanel } from '@/components/patient/TrendChartPanel';
import { ProgressPhotoTracker } from '@/components/patient/ProgressPhotoTracker';
import { AutoInsightsPanel } from '@/components/patient/AutoInsightsPanel';
import { Camera, TrendingUp, Target, Lightbulb } from 'lucide-react';

// Example of how to integrate ProgressPhotoTracker as a tab in Health Insights
export default function HealthInsightsExample() {
  const [activeTab, setActiveTab] = useState('trends');

  return (
    <PatientLayout>
      <motion.div 
        className="space-y-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            Health Insights
          </h1>
          <p className="text-muted-foreground">
            Track your progress and get personalized insights
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-2 p-1 h-auto">
            <TabsTrigger 
              value="trends" 
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              Trends
            </TabsTrigger>
            <TabsTrigger 
              value="goals" 
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white flex items-center gap-2"
            >
              <Target className="w-4 h-4" />
              Goals
            </TabsTrigger>
            <TabsTrigger 
              value="progress" 
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              Progress Photos
            </TabsTrigger>
            <TabsTrigger 
              value="insights" 
              className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white flex items-center gap-2"
            >
              <Lightbulb className="w-4 h-4" />
              AI Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-6">
            <TrendChartPanel vitals={[]} />
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <WeeklyGoalsTracker />
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <ProgressPhotoTracker />
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <AutoInsightsPanel />
          </TabsContent>
        </Tabs>
      </motion.div>
    </PatientLayout>
  );
}