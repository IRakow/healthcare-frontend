import React from 'react';
import { motion } from 'framer-motion';
import PatientLayout from '@/components/layout/PatientLayout';
import { ScanNutritionLabel } from '@/components/patient/ScanNutritionLabel';
import { SmartSnackPanel } from '@/components/patient/SmartSnackPanel';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, 
  Apple, 
  TrendingUp, 
  AlertTriangle,
  BarChart3,
  Lightbulb
} from 'lucide-react';

export default function FoodIntel() {
  const navigate = useNavigate();

  return (
    <PatientLayout>
      <motion.div 
        className="space-y-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 p-8 text-white">
          <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-3">Food Intelligence Center</h1>
            <p className="text-orange-50 text-lg mb-6 max-w-2xl">
              Make smarter food choices with AI-powered nutrition analysis and personalized recommendations.
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card 
            className="cursor-pointer hover:shadow-lg transition-all hover:scale-105 p-6"
            onClick={() => document.getElementById('scan-section')?.scrollIntoView({ behavior: 'smooth' })}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Camera className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold">Scan Labels</h3>
                <p className="text-sm text-muted-foreground">Analyze nutrition facts instantly</p>
              </div>
            </div>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-all hover:scale-105 p-6"
            onClick={() => navigate('/patient/meal-plan')}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Apple className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Meal Planner</h3>
                <p className="text-sm text-muted-foreground">Get personalized meal suggestions</p>
              </div>
            </div>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-lg transition-all hover:scale-105 p-6"
            onClick={() => navigate('/patient/nutrition')}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Nutrition Tracking</h3>
                <p className="text-sm text-muted-foreground">Monitor your daily intake</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Insights */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            Your Recent Food Insights
          </h2>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  Great protein intake!
                </p>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                  You've met your protein goals 5 days in a row
                </p>
              </div>
            </div>
            
            <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/30 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                  Watch your sodium
                </p>
                <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                  Yesterday's intake was 35% above recommended levels
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Smart Snacks */}
        <SmartSnackPanel />

        {/* Nutrition Label Scanner */}
        <div id="scan-section">
          <ScanNutritionLabel />
        </div>
      </motion.div>
    </PatientLayout>
  );
}