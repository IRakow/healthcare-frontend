import * as React from "react"
import { cn } from "@/lib/utils"

interface TabsContextType {
  value: string
  onValueChange: (value: string) => void
}

const TabsContext = React.createContext<TabsContextType | undefined>(undefined)

interface TabsProps {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  className?: string
  children: React.ReactNode
}

export function Tabs({ 
  defaultValue, 
  value: controlledValue, 
  onValueChange, 
  className, 
  children 
}: TabsProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue || '')
  const value = controlledValue ?? uncontrolledValue
  
  const handleValueChange = React.useCallback((newValue: string) => {
    if (!controlledValue) {
      setUncontrolledValue(newValue)
    }
    onValueChange?.(newValue)
  }, [controlledValue, onValueChange])

  return (
    <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
      <div className={cn(className)}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

export function TabsList({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("inline-flex h-10 items-center justify-center rounded-xl bg-white/30 backdrop-blur-md backdrop-saturate-150 border border-white/10 shadow-md p-1 transition-all duration-300", className)}>
      {children}
    </div>
  )
}

export function TabsTrigger({ 
  value, 
  className, 
  children 
}: { 
  value: string
  className?: string
  children: React.ReactNode 
}) {
  const context = React.useContext(TabsContext)
  if (!context) throw new Error('TabsTrigger must be used within Tabs')
  
  const isSelected = context.value === value

  return (
    <button
      onClick={() => context.onValueChange(value)}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 ease-in-out backdrop-blur-sm",
        isSelected
          ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg ring-2 ring-blue-300"
          : "text-gray-700 hover:bg-blue-100",
        className
      )}
    >
      {children}
    </button>
  )
}

export function TabsContent({ 
  value, 
  className, 
  children 
}: { 
  value: string
  className?: string
  children: React.ReactNode 
}) {
  const context = React.useContext(TabsContext)
  if (!context) throw new Error('TabsContent must be used within Tabs')
  
  if (context.value !== value) return null

  return (
    <div className={cn("mt-4 rounded-2xl bg-white/30 backdrop-blur-md backdrop-saturate-150 p-6 shadow-xl border border-white/10 transition-all duration-300", className)}>
      {children}
    </div>
  )
}

// Simple tabs component for backward compatibility
export function SimpleTabs({ tabs, active, onSelect }: any) {
  return (
    <div className="flex border-b border-gray-200 mb-4 overflow-x-auto">
      {tabs.map((tab: string) => (
        <button
          key={tab}
          onClick={() => onSelect(tab)}
          className={`whitespace-nowrap px-4 py-2 text-sm font-medium border-b-2 transition-colors ${active === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-blue-500 hover:border-blue-300'}`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}