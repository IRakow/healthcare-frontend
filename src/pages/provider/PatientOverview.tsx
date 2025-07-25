import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import LifestyleStreaks from '@/pages/patient/LifestyleStreaks';
import MealQualityFeedback from '@/pages/patient/MealQualityFeedback';
import WeeklyPlanner from '@/pages/patient/WeeklyPlanner';
import { Card } from '@/components/ui/card';

export default function PatientOverview() {
  const [tab, setTab] = useState('streaks');

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-blue-800 tracking-tight mb-4">👩‍⚕️ Patient Overview</h1>

      <Tabs defaultValue={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="streaks">🔥 Streaks</TabsTrigger>
          <TabsTrigger value="meals">🍽️ Meal Scores</TabsTrigger>
          <TabsTrigger value="planner">📅 Weekly Plan</TabsTrigger>
        </TabsList>

        <TabsContent value="streaks">
          <LifestyleStreaks patientId="demo-id" />
        </TabsContent>

        <TabsContent value="meals">
          <MealQualityFeedback patientId="demo-id" />
        </TabsContent>

        <TabsContent value="planner">
          <WeeklyPlanner patientId="demo-id" readOnly />
        </TabsContent>
      </Tabs>

      <Card className="glass-card">
        <p className="text-sm text-gray-600 italic">
          Note: You are viewing a read-only summary of this patient's lifestyle data.
        </p>
      </Card>
    </div>
  );
}