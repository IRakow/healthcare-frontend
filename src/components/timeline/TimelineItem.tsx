import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface TimelineItemProps {
  icon: ReactNode
  timestamp: string
  title: string
  description?: string
  className?: string
}

export function TimelineItem({ icon, timestamp, title, description, className }: TimelineItemProps) {
  return (
    <li className={cn("relative flex gap-4 pb-4", className)}>
      {/* Vertical line */}
      <div className="absolute left-[1.125rem] top-[2.5rem] h-full w-0.5 bg-zinc-200 dark:bg-zinc-700" />
      
      {/* Icon container */}
      <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white dark:bg-zinc-900 ring-4 ring-white dark:ring-zinc-900">
        {icon}
      </div>
      
      {/* Content */}
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium leading-none">{title}</h4>
          <time className="text-xs text-muted-foreground">{timestamp}</time>
        </div>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </li>
  )
}