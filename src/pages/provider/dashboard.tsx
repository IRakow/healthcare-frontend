// File: src/pages/provider/dashboard.tsx (FULL PROVIDER STATION)
import { CommandBar } from '@/components/ai/CommandBar'
import { GlassCard } from '@/components/ui/GlassCard'
import { Section } from '@/components/ui/Section'
import { AISummarySidebar } from '@/components/ai/AISummarySidebar'
import { ProviderAnalytics } from '@/components/provider/ProviderAnalytics'
import { VisitReviewQueue } from '@/components/provider/VisitReviewQueue'
import { PatientList } from '@/components/provider/PatientList'
import { Calendar } from '@/components/provider/Calendar'
import { PatientTimelineViewer } from '@/components/provider/PatientTimelineViewer'
import { PatientChartViewer } from '@/components/provider/PatientChartViewer'
import { LiveVideoVisit } from '@/components/provider/LiveVideoVisit'
import { VisitNotes } from '@/components/provider/VisitNotes'
import { AnimatedLogo } from '@/components/ui/AnimatedLogo'
import { PatientRiskFlags } from '@/components/provider/PatientRiskFlags'

export default function ProviderDashboard() {
  return (
    <div className="p-6">
      <CommandBar />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 bg-black text-white">

        <div className="lg:col-span-2 space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Provider Clinical Station</h1>
            <AnimatedLogo />
          </div>

          <Section title="🎥 Live Telemedicine">
            <LiveVideoVisit />
          </Section>

          <Section title="📋 Visit Notes + AI SOAP">
            <VisitNotes />
          </Section>

          <Section title="🧑 Patient Record">
            <PatientChartViewer />
          </Section>

          <Section title="📅 Schedule + Review Queue">
            <Calendar />
            <VisitReviewQueue />
          </Section>

          <Section title="⚠️ Patient Risk Flags">
            <PatientRiskFlags />
          </Section>

          <Section title="📈 Analytics + Insights">
            <ProviderAnalytics />
          </Section>

          <Section title="🕒 Timeline Viewer">
            <PatientTimelineViewer />
          </Section>
        </div>

        <div className="lg:col-span-1">
          <AISummarySidebar />
        </div>
      </div>
    </div>
  )
}