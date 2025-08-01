// Module 10: AdminAuditTrailViewer.tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ShieldCheck } from 'lucide-react'

const auditTrail = [
  { user: 'ian@admin.com', action: 'Updated employer profile', time: 'Today 3:22 PM' },
  { user: 'dr.lee@nova.com', action: 'Reviewed AI chat', time: 'Today 2:18 PM' },
  { user: 'support@root.com', action: 'Reset password for patient ID 331', time: 'Yesterday' }
]

export function AdminAuditTrailViewer() {
  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="text-orange-600 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5" /> Audit Trail
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm space-y-3">
        {auditTrail.map((log, i) => (
          <div key={i} className="border-b pb-1">
            <p className="font-medium text-slate-800">{log.user}</p>
            <p className="text-xs text-gray-500">{log.action}</p>
            <p className="text-xs text-gray-400">{log.time}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}