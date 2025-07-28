import { GlassCard } from '@/components/ui/GlassCard'
import { Section } from '@/components/ui/Section'
import { FileSearch, ShieldAlert, Bot } from 'lucide-react'

export default function AdminSuperPanel() {
  return (
    <div className="space-y-6 p-6">
      <Section title="Audit Logs" icon={FileSearch}>
        <GlassCard>
          <p className="text-white">View and filter all activity across the system</p>
        </GlassCard>
      </Section>
      <Section title="Security Flags" icon={ShieldAlert}>
        <GlassCard>
          <p className="text-white">2 elevated privilege alerts this week</p>
        </GlassCard>
      </Section>
      <Section title="AI Usage Logs" icon={Bot}>
        <GlassCard>
          <p className="text-white">38 patient queries summarized using Gemini</p>
        </GlassCard>
      </Section>
    </div>
  )
}