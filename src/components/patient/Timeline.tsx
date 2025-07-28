import { GlassCard } from '@/components/ui/GlassCard'
import { Section } from '@/components/ui/Section'
import { Clock } from 'lucide-react'

export default function Timeline() {
  return (
    <Section title="Patient Timeline" icon={Clock}>
      <GlassCard>
        <p className="text-white">🩺 July 25 - Visit Summary<br />💬 July 24 - AI Q&A session<br />🧪 July 20 - Lab Results Uploaded</p>
      </GlassCard>
    </Section>
  )
}