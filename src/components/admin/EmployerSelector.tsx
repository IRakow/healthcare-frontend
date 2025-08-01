import { useState } from 'react'
import { Building2, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface EmployerSelectorProps {
  className?: string
}

export function EmployerSelector({ className = '' }: EmployerSelectorProps) {
  const [selectedEmployer, setSelectedEmployer] = useState('all')
  const [isOpen, setIsOpen] = useState(false)

  const employers = [
    { id: 'all', name: 'All Employers', count: 156 },
    { id: 'tech-corp', name: 'TechCorp Inc.', count: 45 },
    { id: 'health-first', name: 'HealthFirst Solutions', count: 38 },
    { id: 'finance-pro', name: 'FinancePro LLC', count: 29 },
    { id: 'retail-max', name: 'RetailMax Group', count: 44 }
  ]

  const selected = employers.find(e => e.id === selectedEmployer) || employers[0]

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-4 py-2.5 bg-white/80 backdrop-blur border border-gray-200 rounded-xl hover:bg-white/90 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-sky-600" />
          <span className="font-medium text-gray-900">{selected.name}</span>
          <span className="text-xs text-gray-500">({selected.count})</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 w-full bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden z-50"
          >
            {employers.map((employer) => (
              <button
                key={employer.id}
                onClick={() => {
                  setSelectedEmployer(employer.id)
                  setIsOpen(false)
                }}
                className={`w-full px-4 py-3 text-left hover:bg-sky-50 transition-colors flex items-center justify-between ${
                  employer.id === selectedEmployer ? 'bg-sky-50' : ''
                }`}
              >
                <span className="font-medium text-gray-900">{employer.name}</span>
                <span className="text-sm text-gray-500">{employer.count}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}