// src/pages/patient/index.tsx

import PatientLayout from '@/components/layout/PatientLayout';
import PatientHealthDashboard from '@/components/patient/PatientHealthDashboard';
import Link from 'next/link';

export default function PatientDashboardIndex() {
  return (
    <PatientLayout>
      <PatientHealthDashboard />

      <section className="mt-12 px-6 py-10 bg-gradient-to-br from-blue-50 via-white to-teal-50 rounded-xl shadow-xl border border-blue-100">
        <h2 className="text-3xl font-extrabold mb-8 text-center text-blue-900 tracking-tight animate-fade-in">
          🧠 AI Power Tools & Smart Health Features
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          <Link href="/patient/MeditationImmersive" className="glass-tile hover:scale-[1.02] transition-transform duration-300 ease-in-out shadow-md hover:shadow-xl bg-white/50 backdrop-blur-lg rounded-2xl p-4 text-blue-900 font-semibold text-center">🧘 Immersive Meditation</Link>
          <Link href="/patient/SmartGroceryMode" className="glass-tile">🛒 Smart Grocery Planner</Link>
          <Link href="/patient/MealGenerator" className="glass-tile">🍽️ AI Meal Generator</Link>
          <Link href="/patient/LifestyleAISummary" className="glass-tile">📊 Lifestyle AI Coach</Link>
          <Link href="/patient/MedicationManager" className="glass-tile">💊 Medication Safety</Link>
          <Link href="/patient/MealPlanner" className="glass-tile">🥗 Meal Planner</Link>
          <Link href="/patient/WearablesDashboard" className="glass-tile">📱 Wearables Dashboard</Link>
          <Link href="/patient/PatientTrends" className="glass-tile">📈 Health Trends</Link>
          <Link href="/patient/CustomMeditation" className="glass-tile">🎵 Custom Meditations</Link>
          <Link href="/patient/GroceryMode" className="glass-tile">🛍️ Grocery Mode</Link>
          <Link href="/patient/TelemedVisitSimple" className="glass-tile">📞 Simple Telemed</Link>
          <Link href="/patient/Chat" className="glass-tile">💬 Chat</Link>
          <Link href="/patient/PatientMessages" className="glass-tile">📨 Secure Messages</Link>
          <Link href="/patient/Health Insights" className="glass-tile">📊 Health Insights</Link>
          <Link href="/patient/All Features" className="glass-tile">🚀 All Features Demo</Link>
          <Link href="/patient/MeditationHistory" className="glass-tile">🧘 Meditation History</Link>
          <Link href="/patient/MeditationSessionLog" className="glass-tile">🪔 Session Log</Link>
          <Link href="/patient/MeditationStart" className="glass-tile">⏯️ Start Meditation</Link>
          <Link href="/patient/LabViewer" className="glass-tile">🧬 Lab Results</Link>
          <Link href="/patient/WeeklyGoals" className="glass-tile">📅 Weekly Goals</Link>
          <Link href="/patient/Vitals" className="glass-tile">💓 Vitals</Link>
          <Link href="/patient/MediaCheck" className="glass-tile">📷 Media Check</Link>
          <Link href="/patient/Messages" className="glass-tile">📬 Messages</Link>
          <Link href="/patient/Billing" className="glass-tile">💰 Billing</Link>
          <Link href="/patient/TimelineViewer" className="glass-tile">🗓️ Timeline Viewer</Link>
          <Link href="/patient/PatientTimeline" className="glass-tile">🧾 Full Timeline</Link>
          <Link href="/patient/Dashboard" className="glass-tile">🧊 Legacy Dashboard</Link>
          <Link href="/patient/HealthHub" className="glass-tile">📚 Health Hub</Link>
          <Link href="/patient/health" className="glass-tile">🩺 Health Overview</Link>
        </div>
      </section>
    </PatientLayout>
  );
}