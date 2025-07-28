import { GlassCard } from '@/components/ui/GlassCard'

export default function Chart() {
  return (
    <div className="p-4">
      <div className="space-y-4">
        <div className="flex items-end gap-2 h-32">
          <div className="bg-gradient-to-t from-emerald-500 to-emerald-400 w-full h-3/4 rounded-t"></div>
          <div className="bg-gradient-to-t from-indigo-500 to-indigo-400 w-full h-full rounded-t"></div>
          <div className="bg-gradient-to-t from-rose-500 to-rose-400 w-full h-1/2 rounded-t"></div>
          <div className="bg-gradient-to-t from-amber-500 to-amber-400 w-full h-2/3 rounded-t"></div>
          <div className="bg-gradient-to-t from-purple-500 to-purple-400 w-full h-5/6 rounded-t"></div>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
        </div>
        <p className="text-center text-sm text-white">AI Interactions by Day</p>
      </div>
    </div>
  )
}