import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Salad } from 'lucide-react'

const groceries = [
  { item: 'Greek Yogurt', reason: 'High protein breakfast' },
  { item: 'Spinach', reason: 'Low-oxalate greens for iron' },
  { item: 'Chia Seeds', reason: 'Hydration + fiber' },
  { item: 'Frozen Blueberries', reason: 'Low sugar fruit for smoothies' }
]

export function SmartGroceryList() {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-700">
          <Salad className="w-5 h-5" />
          Smart Grocery Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {groceries.map((g, i) => (
          <div key={i} className="border-b pb-2 border-slate-200">
            <p className="font-medium text-slate-800">{g.item}</p>
            <p className="text-xs text-gray-500">{g.reason}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}