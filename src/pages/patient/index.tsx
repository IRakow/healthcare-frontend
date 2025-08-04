// src/pages/patient/index.tsx

import PatientLayout from '@/components/layout/PatientLayout';
import PatientHealthDashboard from '@/components/patient/PatientHealthDashboard';
import { Link } from 'react-router-dom';

import AssistantBarOverlay from '@/components/assistant/AssistantBarOverlay';
import { speak } from '@/lib/voice/RachelTTSQueue';
import { useEffect } from 'react';
import { useRachelMemory } from '@/lib/voice/useRachelMemoryStore';
import { handleThreadFollowup } from '@/lib/voice/handleThreadFollowup';

export default function PatientDashboardIndex() {
  const { rachelMemory, setRachelMemory } = useRachelMemory();

  useEffect(() => {
    if (!rachelMemory.sessionStarted) {
      setRachelMemory({ ...rachelMemory, sessionStarted: true });
      speak("Welcome back. I'm here if you need anything — just speak your request.");
      console.log('Patient dashboard loaded at:', new Date().toISOString());

      handleThreadFollowup('patient-dashboard-landing', {
        context: 'patient-dashboard',
        source: 'supabase',
        model: 'gemini-patient',
        memory: {
          userId: rachelMemory.userId,
          preferences: rachelMemory.preferences,
          goals: rachelMemory.goals || [],
          alerts: rachelMemory.alerts || [],
        },
        routes: [
          '/patient/appointments',
          '/patient/medications',
          '/patient/TimelineViewer',
          '/patient/LabViewer',
          '/patient/MealGenerator',
          '/patient/MeditationImmersive',
        ],
        allowDomMutation: true,
        allowPageNavigation: true,
        allowSupabaseWrites: true
      });
    }
  }, []);
  return (
    <PatientLayout>
      <PatientHealthDashboard />

      <section className="mt-12 px-4 sm:px-6 py-10 bg-gradient-to-br from-blue-50 via-white to-teal-50 rounded-xl shadow-xl border border-blue-100 overflow-x-hidden">
        <h2 className="text-3xl font-extrabold mb-8 text-center text-blue-900 tracking-tight animate-fade-in">
          🧠 AI Power Tools & Smart Health Features (v2)
        </h2>
        {/* Deployment timestamp: ${new Date().toISOString()} */}
        <div className="space-y-12">
  <div>
    <h3 className="text-xl font-semibold text-blue-700 mb-4">🧘 Wellness</h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <Link to="/patient/MeditationImmersive" className="glass-tile w-full min-h-[88px] flex items-center justify-center text-center">Immersive Meditation</Link>
      <Link to="/patient/CustomMeditation" className="glass-tile">Custom Meditations</Link>
      <Link to="/patient/MeditationStart" className="glass-tile">Start Meditation</Link>
      <Link to="/patient/MeditationHistory" className="glass-tile">Meditation History</Link>
      <Link to="/patient/MeditationSessionLog" className="glass-tile">Session Log</Link>
    </div>
  </div>

  <div>
    <h3 className="text-xl font-semibold text-blue-700 mb-4">🥗 Nutrition & Meals</h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <Link to="/patient/SmartGroceryMode" className="glass-tile">Smart Grocery Planner</Link>
      <Link to="/patient/GroceryMode" className="glass-tile">Grocery Mode</Link>
      <Link to="/patient/MealGenerator" className="glass-tile">AI Meal Generator</Link>
      <Link to="/patient/MealPlanner" className="glass-tile">Meal Planner</Link>
    </div>
  </div>

  <div>
    <h3 className="text-xl font-semibold text-blue-700 mb-4">🧠 AI Tools & Coaching</h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <Link to="/patient/LifestyleAISummary" className="glass-tile">Lifestyle AI Coach</Link>
      <Link to="/patient/PatientTrends" className="glass-tile">Health Trends</Link>
      <Link to="/patient/EverythingFunctional" className="glass-tile">All Features Demo</Link>
    </div>
  </div>

  <div>
    <h3 className="text-xl font-semibold text-blue-700 mb-4">💊 Health Management</h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <Link to="/patient/MedicationManager" className="glass-tile">Medication Safety</Link>
      <Link to="/patient/LabViewer" className="glass-tile">Lab Results</Link>
      <Link to="/patient/Vitals" className="glass-tile">Vitals</Link>
      <Link to="/patient/MediaCheck" className="glass-tile">Media Check</Link>
      <Link to="/patient/Billing" className="glass-tile">Billing</Link>
    </div>
  </div>

  <div>
    <h3 className="text-xl font-semibold text-blue-700 mb-4">📞 Communication & Telehealth</h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <Link to="/patient/TelemedVisit" className="glass-tile">Telemedicine Visit</Link>
      <Link to="/patient/Chat" className="glass-tile">Chat</Link>
      <Link to="/patient/PatientMessages" className="glass-tile">Secure Messages</Link>
      <Link to="/patient/Messages" className="glass-tile">Messages</Link>
    </div>
  </div>

  <div>
    <h3 className="text-xl font-semibold text-blue-700 mb-4">📂 Other Tools</h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <Link to="/patient/TimelineViewer" className="glass-tile">Timeline Viewer</Link>
      <Link to="/patient/PatientTimeline" className="glass-tile">Full Timeline</Link>
      <Link to="/patient/Dashboard" className="glass-tile">Legacy Dashboard</Link>
      <Link to="/patient/HealthHub" className="glass-tile">Health Hub</Link>
      <Link to="/patient/health" className="glass-tile">Health Overview</Link>
      <Link to="/patient/WearablesDashboard" className="glass-tile">Wearables Dashboard</Link>
    </div>
  </div>
</div>
      </section>
      <div className='fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto'><AssistantBarOverlay /></div>
    </PatientLayout>
  );
}