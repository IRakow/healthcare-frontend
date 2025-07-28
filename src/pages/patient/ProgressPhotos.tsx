import React from 'react';
import { motion } from 'framer-motion';
import PatientLayout from '@/components/layout/PatientLayout';
import { ProgressPhotoTracker } from '@/components/patient/ProgressPhotoTracker';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, TrendingUp, Calendar, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProgressPhotos() {
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
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 p-8 text-white">
          <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <h1 className="text-4xl font-bold mb-3">Track Your Journey</h1>
            <p className="text-purple-50 text-lg mb-6 max-w-2xl">
              Document your health transformation with progress photos and see how far you've come.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button 
                size="lg" 
                variant="secondary" 
                className="bg-white/90 text-purple-700 hover:bg-white"
                onClick={() => navigate('/patient/goals')}
              >
                <Target className="w-4 h-4 mr-2" />
                Set Goals
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-white border-white hover:bg-white/20"
                onClick={() => navigate('/patient/health-dashboard')}
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                View Health Metrics
              </Button>
            </div>
          </div>
        </div>

        {/* Tips Card */}
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Camera className="w-5 h-5 text-purple-600" />
            Photo Tips for Best Results
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h3 className="font-medium text-sm">Consistency is Key</h3>
              <p className="text-sm text-muted-foreground">
                Take photos at the same time of day, in the same location, with similar lighting.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-sm">Same Poses</h3>
              <p className="text-sm text-muted-foreground">
                Use front, side, and back views. Keep the same distance from camera.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-sm">Track More Than Weight</h3>
              <p className="text-sm text-muted-foreground">
                Note how you feel, energy levels, and non-scale victories in your notes.
              </p>
            </div>
          </div>
        </Card>

        {/* Progress Photo Tracker */}
        <ProgressPhotoTracker />

        {/* Motivation Card */}
        <Card className="p-6 text-center bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30">
          <Calendar className="w-12 h-12 text-orange-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold mb-2">Stay Consistent!</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Progress happens one day at a time. Keep documenting your journey - 
            future you will thank you for capturing these moments!
          </p>
        </Card>
      </motion.div>
    </PatientLayout>
  );
}