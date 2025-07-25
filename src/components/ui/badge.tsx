import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string
  variant?: 'default' | 'secondary' | 'destructive' | 'outline'
}

const variantStyles = {
  default: "bg-blue-100 text-blue-700 hover:bg-blue-200",
  secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
  destructive: "bg-red-100 text-red-700 hover:bg-red-200",
  outline: "border border-gray-300 text-gray-700"
}

export function Badge({ 
  label, 
  className, 
  variant = 'default',
  children,
  ...props 
}: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children || label}
    </div>
  )
}