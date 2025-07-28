// File: src/pages/patient/dashboard.tsx

import PatientLayout from '@/components/layout/PatientLayout';
import { GlassCard } from '@/components/ui/GlassCard';
import { Section } from '@/components/ui/Section';
import {
  Activity,
  CalendarCheck,
  Bot,
  Utensils,
  Pill,
  Clock,
  ImageIcon
} from 'lucide-react';

export default function PatientDashboard() {
  return (
    <PatientLayout>
      <div className="space-y-10 p-6 max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-sky-800">Patient Dashboard</h1>

        <Section title="📅 Next Appointment" icon={CalendarCheck}>
          <GlassCard>
            <p className="text-gray-800 text-lg">Tomorrow at 2:30 PM with Dr. Smith</p>
          </GlassCard>
        </Section>

        <Section title="🩺 Health Vitals" icon={Activity}>
          <GlassCard>
            <p className="text-gray-700">Sleep: 7.5h • Hydration: 64oz • Protein: 120g</p>
          </GlassCard>
        </Section>

        <Section title="🍽 Food Log" icon={Utensils}>
          <GlassCard>
            <p className="text-gray-700">Breakfast: Oatmeal + blueberries (22g protein)</p>
            <p className="text-gray-700">Lunch: Chicken wrap + apple (35g protein)</p>
          </GlassCard>
        </Section>

        <Section title="💊 Medications" icon={Pill}>
          <GlassCard>
            <p className="text-gray-700">Metformin 500mg • 1 tab AM</p>
            <p className="text-gray-700">Lisinopril 10mg • 1 tab PM</p>
          </GlassCard>
        </Section>

        <Section title="🕒 Timeline Activity" icon={Clock}>
          <GlassCard>
            <p className="text-gray-700">🧠 July 25 – AI chat: "What's my sleep trend?"</p>
            <p className="text-gray-700">📄 July 24 – Uploaded: Insurance card</p>
            <p className="text-gray-700">💬 July 23 – Dr. Smith sent a message</p>
          </GlassCard>
        </Section>

        <Section title="📸 Upload + Camera Tools" icon={ImageIcon}>
          <GlassCard className="space-y-3">
            <button className="bg-sky-500 hover:bg-sky-600 text-white font-medium py-2 px-4 rounded-lg w-full transition-all">
              📷 Upload Symptom Photo
            </button>
            <button className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 px-4 rounded-lg w-full transition-all">
              🌬 Start Breathing Cam
            </button>
          </GlassCard>
        </Section>

        <Section title="🧠 AI Assistant History" icon={Bot}>
          <GlassCard>
            <p className="text-gray-700">"Log 2 scrambled eggs" → ✅ logged</p>
            <p className="text-gray-700">"Add Tylenol 500mg" → ✅ added</p>
            <p className="text-gray-700">"Schedule with Dr. Ellis" → 📅 booked</p>
          </GlassCard>
        </Section>
      </div>
    </PatientLayout>
  );
}