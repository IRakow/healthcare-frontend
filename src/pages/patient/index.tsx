// src/pages/patient/index.tsx

import PatientLayout from '@/components/layout/PatientLayout';
import PatientHealthDashboard from '@/components/patient/PatientHealthDashboard';
import Link from 'next/link';

export default function PatientDashboardIndex() {
  return (
    <PatientLayout>
      <PatientHealthDashboard />

      <section className="mt-10 p-4">
        <h2 className="text-2xl font-bold mb-6 text-blue-800">🧠 AI Power Tools + Connected Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/patient/MeditationImmersive" className="card">🧘 Immersive Meditation</Link>
          <Link href="/patient/SmartGroceryMode" className="card">🛒 Smart Grocery Planner</Link>
          <Link href="/patient/MealGenerator" className="card">🍽️ AI Meal Generator</Link>
          <Link href="/patient/LifestyleAISummary" className="card">📊 Lifestyle AI Coach</Link>
          <Link href="/patient/MedicationManager" className="card">💊 Medication Safety Manager</Link>
          <Link href="/patient/MealPlanner" className="card">🥗 Meal Planner</Link>
          <Link href="/patient/WearablesDashboard" className="card">📱 Wearables Dashboard</Link>
          <Link href="/patient/PatientTrends" className="card">📈 Patient Trends</Link>
          <Link href="/patient/CustomMeditation" className="card">🎵 Custom Meditations</Link>
          <Link href="/patient/GroceryMode" className="card">🛍️ Grocery Mode</Link>
          <Link href="/patient/TelemedVisitSimple" className="card">📞 Simple Telemed Visit</Link>
          <Link href="/patient/Chat" className="card">💬 Chat</Link>
          <Link href="/patient/PatientMessages" className="card">📨 Messages (AI)</Link>
          <Link href="/patient/HealthInsightsExample" className="card">📊 Health Insights</Link>
          <Link href="/patient/EverythingFunctional" className="card">🚀 Everything Functional</Link>
          <Link href="/patient/MeditationHistory" className="card">🧘 Meditation History</Link>
          <Link href="/patient/MeditationSessionLog" className="card">📝 Session Log</Link>
          <Link href="/patient/MeditationStart" className="card">⏯️ Meditation Start</Link>
          <Link href="/patient/LabViewer" className="card">🧬 Lab Viewer</Link>
          <Link href="/patient/WeeklyGoals" className="card">📅 Weekly Goals</Link>
          <Link href="/patient/Vitals" className="card">💓 Vitals Chart</Link>
          <Link href="/patient/MediaCheck" className="card">📷 Media Check</Link>
          <Link href="/patient/Messages" className="card">📬 Message Center</Link>
          <Link href="/patient/Billing" className="card">💰 Billing Dashboard</Link>
          <Link href="/patient/TimelineViewer" className="card">🗓️ Timeline Viewer</Link>
          <Link href="/patient/PatientTimeline" className="card">🧾 Patient Timeline</Link>
          <Link href="/patient/Dashboard" className="card">🧊 Legacy Dashboard</Link>
          <Link href="/patient/HealthHub" className="card">📚 Health Hub</Link>
          <Link href="/patient/health" className="card">🩺 Health Overview</Link>
        </div>
      </section>
    </PatientLayout>
  );
}