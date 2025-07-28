import { GlassCard } from '@/components/ui/GlassCard'
import { Section } from '@/components/ui/Section'
import { Activity } from 'lucide-react'

export default function PatientHealthDashboard() {
  return (
    <Section title="Health Overview" icon={Activity}>
      <GlassCard>
        <p className="text-white">Sleep: 7h 15m • Hydration: 70oz • Protein: 125g</p>
      </GlassCard>
    </Section>
  )
}