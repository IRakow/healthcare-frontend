import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Tabs } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import LifestyleStreaks from '@/components/patient/LifestyleStreaks';
import MealQualityFeedback from '@/components/patient/MealQualityFeedback';
import WeeklyPlanner from '@/components/patient/WeeklyPlanner';

export default function PatientOverview() {
  const { patientId } = useParams<{ patientId: string }>();
  const [tab, setTab] = useState('Streaks');
  const [patientName, setPatientName] = useState('');

  useEffect(() => {
    (async () => {
      if (!patientId) return;
      
      const { data } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', patientId)
        .single();
        
      setPatientName(data?.full_name || 'Patient');
    })();
  }, [patientId]);

  if (!patientId) {
    return <div className="p-6">No patient ID provided</div>;
  }

  return (
    <div className="space-y-4 max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-blue-700">👤 Patient Overview: {patientName}</h1>

      <Tabs tabs={['Streaks', 'Meal Scores', 'Planner']} active={tab} onSelect={setTab} />

      {tab === 'Streaks' && <LifestyleStreaks patientId={patientId} />}
      {tab === 'Meal Scores' && <MealQualityFeedback patientId={patientId} />}
      {tab === 'Planner' && <WeeklyPlanner patientId={patientId} readOnly />}
    </div>
  );
}