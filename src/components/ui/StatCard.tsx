import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string | number
  icon?: ReactNode
  trend?: {
    value: number
    isPositive: boolean
  }
  description?: string
  className?: string
}

export default function StatCard({ label, value, icon, trend, description, className = '' }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className={`rounded-2xl bg-gradient-to-br from-white/80 to-zinc-100/90 dark:from-zinc-900/80 dark:to-zinc-800/90 border border-zinc-200 dark:border-zinc-700 shadow-lg p-5 w-full hover:shadow-xl transition-shadow ${className}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">{label}</div>
        {icon && (
          <div className="text-emerald-500 dark:text-emerald-400">{icon}</div>
        )}
      </div>
      
      <div className="space-y-1">
        <div className="flex items-baseline gap-2">
          <div className="text-2xl font-semibold text-zinc-800 dark:text-white">{value}</div>
          {trend && (
            <span className={`text-xs font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </span>
          )}
        </div>
        
        {description && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{description}</p>
        )}
      </div>
    </motion.div>
  )
}