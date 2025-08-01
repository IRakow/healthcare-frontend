// Module 9: AdminPinnedEmployers.tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Pin } from 'lucide-react'

const pinned = [
  { name: 'NovaHealth', type: 'Medical Group', contact: 'nova@corp.com' },
  { name: 'SkyWellness', type: 'Therapy Group', contact: 'admin@skywell.io' },
  { name: 'BlueRoots', type: 'Nutrition', contact: 'info@blueroots.org' }
]

export function AdminPinnedEmployers() {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-rose-700 flex items-center gap-2">
          <Pin className="w-5 h-5" /> Pinned Employers
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {pinned.map((e, i) => (
          <div key={i} className="flex justify-between items-center border-b pb-2">
            <div>
              <p className="font-semibold text-slate-800">{e.name}</p>
              <p className="text-xs text-gray-500">{e.type}</p>
            </div>
            <a href={`mailto:${e.contact}`} className="text-xs text-blue-600 hover:underline">
              {e.contact}
            </a>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}