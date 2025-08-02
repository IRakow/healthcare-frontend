import AdminLayout from '@/components/layout/AdminLayout'
import { Card } from '@/components/ui/card'
import { useState, useEffect } from 'react'
import { AlertTriangle, CheckCircle, BarChart3, ShieldCheck } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface ComplianceArea {
  category: string
  score: number
  riskLevel: 'low' | 'medium' | 'high'
  recommendation: string
}

export default function AdminCompliancePanel() {
  const [areas, setAreas] = useState<ComplianceArea[]>([])

  useEffect(() => {
    setAreas([
      {
        category: 'Audit Logging',
        score: 72,
        riskLevel: 'medium',
        recommendation: 'Enable logging on EHR export endpoints.'
      },
      {
        category: 'Role Access',
        score: 88,
        riskLevel: 'low',
        recommendation: 'Review provider-level patient download permissions.'
      },
      {
        category: 'MFA Enforcement',
        score: 59,
        riskLevel: 'high',
        recommendation: 'Force MFA for all admin users within 7 days.'
      }
    ])
  }, [])

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-emerald-600" /> HIPAA Compliance Risk Panel
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {areas.map((area, i) => (
          <Card key={i} className="p-4 bg-white/90 rounded-xl space-y-2">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-slate-800 text-sm">{area.category}</h2>
              <span className={`text-xs font-medium capitalize ${
                area.riskLevel === 'high' ? 'text-red-600' : area.riskLevel === 'medium' ? 'text-yellow-600' : 'text-green-600'}`}>{area.riskLevel}</span>
            </div>
            <Progress value={area.score} className="h-2 bg-gray-200" />
            <p className="text-xs text-muted-foreground">{area.recommendation}</p>
          </Card>
        ))}
        {areas.length === 0 && (
          <p className="text-sm text-muted-foreground italic">No compliance data available.</p>
        )}
      </div>
    </AdminLayout>
  )
}