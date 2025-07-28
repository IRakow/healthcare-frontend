import React from 'react'
import { cn } from '@/lib/utils'

export function GlassCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'bg-glass backdrop-blur-xl border border-white/10 shadow-xl rounded-xl p-6 transition-all duration-300 ease-in-out',
        className
      )}
    >
      {children}
    </div>
  )
}