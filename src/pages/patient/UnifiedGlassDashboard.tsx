import React, { Suspense } from 'react';
import { TrendChartPanel } from '@/components/patient/TrendChartPanel';
import { WeeklyGoalsTracker } from '@/components/patient/WeeklyGoalsTracker';
import { AutoInsightsPanel } from '@/components/patient/AutoInsightsPanel';
import { SmartGroceryList } from '@/components/patient/SmartGroceryList';
import { GroceryScannerAI } from '@/components/patient/GroceryScannerAI';
import { PhotoLogger } from '@/components/patient/PhotoLogger';
import { MealPlannerAI } from '@/components/patient/MealPlannerAI';
import { NotificationCenter } from '@/components/patient/NotificationCenter';
import { AIConversationLogger } from '@/components/patient/AIConversationLogger';
import { PDFExportPanel } from '@/components/patient/PDFExportPanel';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

export default function UnifiedGlassDashboard() {
  // Sample data to prevent empty state errors
  const sampleVitals = [
    { date: new Date().toISOString(), hydration: 64, sleep: 7.5, protein: 65 },
    { date: new Date(Date.now() - 86400000).toISOString(), hydration: 72, sleep: 8, protein: 80 },
    { date: new Date(Date.now() - 172800000).toISOString(), hydration: 60, sleep: 6.5, protein: 70 }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-6 space-y-12 max-w-7xl mx-auto"
    >
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <TrendChartPanel vitals={sampleVitals} />
        <WeeklyGoalsTracker />
      </div>

      <Suspense fallback={<Card><CardContent className="p-6">Loading insights...</CardContent></Card>}>
        <AutoInsightsPanel />
      </Suspense>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <Suspense fallback={<Card><CardContent className="p-6">Loading photo logger...</CardContent></Card>}>
          <PhotoLogger userId="currentUser" />
        </Suspense>
        <Suspense fallback={<Card><CardContent className="p-6">Loading scanner...</CardContent></Card>}>
          <GroceryScannerAI />
        </Suspense>
        <Suspense fallback={<Card><CardContent className="p-6">Loading grocery list...</CardContent></Card>}>
          <SmartGroceryList />
        </Suspense>
      </div>

      <Suspense fallback={<Card><CardContent className="p-6">Loading meal planner...</CardContent></Card>}>
        <MealPlannerAI />
      </Suspense>
      <Suspense fallback={<Card><CardContent className="p-6">Loading notifications...</CardContent></Card>}>
        <NotificationCenter />
      </Suspense>
      <Suspense fallback={<Card><CardContent className="p-6">Loading AI logs...</CardContent></Card>}>
        <AIConversationLogger />
      </Suspense>
      <PDFExportPanel
        summaryData={[
          { label: 'Health Goal', value: 'Maintain weight with Mediterranean diet' },
          { label: 'Macros Monitored', value: 'Calories, Protein, Sleep, Hydration' },
          { label: 'Alerts Triggered', value: 'Low protein 3 days, great hydration streak' }
        ]}
        filename="Weekly_Health_Summary.pdf"
      />
    </motion.div>
  );
}