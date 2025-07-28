import { GlassCard } from '@/components/ui/GlassCard'
import { Section } from '@/components/ui/Section'
import { Brain } from 'lucide-react'

export default function MedicalSynthesizer() {
  return (
    <Section title="Medical Synthesizer" icon={Brain} description="Get AI-generated condition briefs and educational insights">
      <GlassCard>
        <p className="text-white">"Chest pain could be due to a number of causes..."</p>
      </GlassCard>
    </Section>
  )
}