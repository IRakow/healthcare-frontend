import { GlassCard } from '@/components/ui/GlassCard'
import { Section } from '@/components/ui/Section'
import { Utensils } from 'lucide-react'

export default function NutritionTracker() {
  return (
    <Section title="Today's Nutrition" icon={Utensils}>
      <GlassCard>
        <p className="text-white">Breakfast: Oatmeal + Blueberries (22g protein)</p>
      </GlassCard>
    </Section>
  )
}