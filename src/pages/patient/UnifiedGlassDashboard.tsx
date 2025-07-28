import React from 'react';
import AssistantBar from '@/components/assistant/AssistantBar';
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

export default function UnifiedGlassDashboard() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-6 space-y-12 max-w-7xl mx-auto"
    >
      <AssistantBar role="patient" />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <TrendChartPanel vitals={[]} />
        <WeeklyGoalsTracker />
      </div>

      <AutoInsightsPanel />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <PhotoLogger userId="currentUser" />
        <GroceryScannerAI />
        <SmartGroceryList />
      </div>

      <MealPlannerAI />
      <NotificationCenter />
      <AIConversationLogger />
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