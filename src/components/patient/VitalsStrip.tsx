import { Droplets, Moon, Apple, Footprints } from 'lucide-react'
import StatCard from '@/components/ui/StatCard'

export function VitalsStrip() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
      <StatCard label="Hydration" value="64 oz" icon={<Droplets className="w-4 h-4" />} description="Goal: 80 oz" />
      <StatCard label="Sleep" value="6.8 hrs" icon={<Moon className="w-4 h-4" />} description="Last Night" />
      <StatCard label="Protein" value="58g" icon={<Apple className="w-4 h-4" />} description="Today" />
      <StatCard label="Steps" value="7,412" icon={<Footprints className="w-4 h-4" />} description="So far" />
    </div>
  )
}