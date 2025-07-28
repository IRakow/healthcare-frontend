import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import AssistantBar from '@/components/assistant/AssistantBar';
import { HealthGoalWizard } from '@/components/patient/HealthGoalWizard';
import { TrendChartPanel } from '@/components/patient/TrendChartPanel';
import { WeeklyGoalsTracker } from '@/components/patient/WeeklyGoalsTracker';
import { AutoInsightsPanel } from '@/components/patient/AutoInsightsPanel';
import { PhotoLogger } from '@/components/patient/PhotoLogger';
import { GroceryScannerAI } from '@/components/patient/GroceryScannerAI';
import { SmartGroceryList } from '@/components/patient/SmartGroceryList';
import { NotificationCenter } from '@/components/patient/NotificationCenter';
import { RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function HealthDashboard() {
  const [showWizard, setShowWizard] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    })();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6"
    >
      {/* Floating Assistant Bar */}
      <AssistantBar role="patient" />

      {/* Show wizard on first load */}
      {showWizard && (
        <HealthGoalWizard onFinish={() => setShowWizard(false)} />
      )}

      {/* Main Dashboard Content (hidden while wizard is active) */}
      {!showWizard && (
        <>
          {/* Header with rerun button */}
          <div className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Your Health Command Center
            </h1>
            <Button
              onClick={() => setShowWizard(true)}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Update Goals
            </Button>
          </div>

          {/* Main Grid Layout */}
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Charts & Goals */}
            <div className="lg:col-span-2 space-y-6">
              <TrendChartPanel vitals={[]} />
              <WeeklyGoalsTracker />
            </div>

            {/* Right Column - AI Insights */}
            <div className="space-y-6">
              <AutoInsightsPanel />
            </div>
          </div>

          {/* Secondary Grid - Interactive Features */}
          <div className="max-w-7xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <PhotoLogger userId={userId || ''} />
            <GroceryScannerAI />
            <div className="md:col-span-2 lg:col-span-1">
              <SmartGroceryList />
            </div>
          </div>

          {/* Notification Center */}
          <div className="max-w-7xl mx-auto mt-8">
            <NotificationCenter />
          </div>
        </>
      )}
    </motion.div>
  );
}

// Usage:
// This dashboard now includes the wizard on first load.
// After completing the wizard, users see their personalized dashboard.
// They can rerun the wizard anytime to update their goals.