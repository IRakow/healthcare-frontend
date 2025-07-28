import React from 'react';
import { useNavigate } from 'react-router-dom';
import { WeeklyGoalsTracker } from '@/components/patient/WeeklyGoalsTracker';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GoalsPage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <Button
          variant="ghost"
          onClick={() => navigate('/patient')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>
      </div>
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Health Goals</h1>
        <p className="text-gray-600 mt-2">Track your weekly health and wellness goals</p>
      </div>
      <div className="grid gap-6">
        <WeeklyGoalsTracker />
      </div>
    </div>
  );
}