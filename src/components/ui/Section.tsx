import React from 'react'
import { LucideIcon } from 'lucide-react'

export function Section({
  title,
  icon: Icon,
  description,
  children
}: {
  title: string
  icon: LucideIcon
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold text-white drop-shadow">{title}</h2>
      </div>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
      {children}
    </div>
  )
}