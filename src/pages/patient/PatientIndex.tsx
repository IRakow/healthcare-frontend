import { useEffect } from 'react';
import { speak } from '@/lib/voice/RachelTTSQueue';
import { useRachelMemoryStore } from '@/lib/voice/useRachelMemoryStore';
import StatCard from '@/components/ui/StatCard';
import DietaryMacroChart from '@/components/nutrition/DietaryMacroChart';
import MealPhotoUpload from '@/components/nutrition/MealPhotoUpload';
import VoiceDietaryInput from '@/components/nutrition/VoiceDietaryInput';
import FileUploadPanel from '@/components/patient/FileUploadPanel';
import { MedicationManager } from '@/components/patient/MedicationManager';
import { SmartIntakeForm } from '@/components/patient/SmartIntakeForm';
import { BookingInterface } from '@/components/patient/BookingInterface';
import { WeeklyGoalsTracker } from '@/components/patient/WeeklyGoalsTracker';
import PatientLabViewer from '@/components/patient/PatientLabViewer';
import PatientTimelineViewer from '@/components/patient/PatientTimelineViewer';

export default function PatientIndex() {
  const rachelMemory = useRachelMemoryStore((s) => s.rachelMemory);
  const setRachelMemory = useRachelMemoryStore((s) => s.setRachelMemory);
  const sessionStarted = useRachelMemoryStore((s) => s.sessionStarted);
  const setSessionStarted = useRachelMemoryStore((s) => s.setSessionStarted);
  const aiMode = useRachelMemoryStore((s) => s.aiMode);
  const setAiMode = useRachelMemoryStore((s) => s.setAiMode);

  useEffect(() => {
    if (!sessionStarted) {
      speak("Welcome back. I'm Rachel. Ask me anything — from labs and food to appointments and medications.");
      setSessionStarted(true);
    }
  }, [sessionStarted, setSessionStarted]);

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        <StatCard title="Today's Protein" value="84g" subtitle="Goal: 100g" />
        <StatCard title="Sleep Duration" value="7h 25m" subtitle="Last night" />
        <StatCard title="Steps Walked" value="8,902" subtitle="So far today" />
      </div>

      <WeeklyGoalsTracker />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="space-y-6">
          <DietaryMacroChart />
          <MealPhotoUpload />
          <VoiceDietaryInput />
        </div>

        <div className="space-y-6">
          <SmartIntakeForm />
          <MedicationManager />
          <BookingInterface />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <FileUploadPanel />
        <PatientLabViewer />
      </div>

      <div className="mt-6">
        <PatientTimelineViewer />
      </div>

      <div className="mt-8 rounded-xl bg-white/40 p-4 shadow-sm border border-white/30 backdrop-blur-md">
        <h2 className="font-semibold text-slate-700 mb-2">Rachel AI Assistant</h2>
        <p className="text-slate-600 mb-2">
          {rachelMemory
            ? `Your last request was: "${rachelMemory}"`
            : "Ask me about your meds, food, labs, or health goals!"}
        </p>

        <label className="block text-sm font-medium text-slate-600 mt-4 mb-1">
          Voice Mode
        </label>
        <select
          value={aiMode}
          onChange={(e) => setAiMode(e.target.value as 'talk' | 'silent')}
          className="rounded-md w-full max-w-xs bg-white/70 border border-slate-300 focus:ring-2 focus:ring-teal-400"
        >
          <option value="talk">Talk (with voice)</option>
          <option value="silent">Silent (text only)</option>
        </select>
      </div>
    </div>
  );
}