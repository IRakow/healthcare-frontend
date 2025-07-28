import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { GlassCard } from '@/components/ui/GlassCard'
import { Section } from '@/components/ui/Section'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  FileText, 
  Lock, 
  Users, 
  Activity,
  Download,
  RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'
import AuditLogViewer from '@/components/admin/AuditLogViewer'

interface ComplianceMetrics {
  overallScore: number
  categories: {
    accessControl: number
    auditLogging: number
    dataEncryption: number
    userTraining: number
    incidentResponse: number
    riskAssessment: number
  }
  issues: ComplianceIssue[]
  lastAssessment: string
}

interface ComplianceIssue {
  id: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  category: string
  description: string
  recommendation: string
  status: 'open' | 'resolved' | 'in_progress'
}

export default function ComplianceDashboard() {
  const [metrics, setMetrics] = useState<ComplianceMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'audit' | 'reports'>('overview')

  useEffect(() => {
    fetchComplianceMetrics()
  }, [])

  const fetchComplianceMetrics = async () => {
    try {
      // In production, this would fetch from a compliance monitoring service
      // For now, we'll calculate metrics based on system data
      
      const [
        { count: totalUsers },
        { count: activeAudits },
        { data: recentIncidents },
        { data: accessLogs }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('audit_logs').select('*', { count: 'exact', head: true })
          .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('security_incidents').select('*').eq('status', 'open'),
        supabase.from('audit_logs').select('*')
          .eq('action', 'emergency_access.granted')
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      ])

      // Calculate compliance scores
      const accessControlScore = calculateAccessControlScore()
      const auditLoggingScore = activeAudits ? Math.min(100, (activeAudits / totalUsers) * 10) : 0
      const dataEncryptionScore = 100 // Supabase handles encryption
      const userTrainingScore = 75 // Placeholder
      const incidentResponseScore = recentIncidents?.length === 0 ? 100 : 50
      const riskAssessmentScore = 80 // Placeholder

      const overallScore = Math.round(
        (accessControlScore + auditLoggingScore + dataEncryptionScore + 
         userTrainingScore + incidentResponseScore + riskAssessmentScore) / 6
      )

      const issues: ComplianceIssue[] = []

      // Generate compliance issues based on scores
      if (auditLoggingScore < 80) {
        issues.push({
          id: '1',
          severity: 'high',
          category: 'Audit Logging',
          description: 'Insufficient audit logging coverage',
          recommendation: 'Ensure all PHI access is being logged',
          status: 'open'
        })
      }

      if (accessLogs && accessLogs.length > 0) {
        issues.push({
          id: '2',
          severity: 'medium',
          category: 'Access Control',
          description: `${accessLogs.length} emergency access events in the last 7 days`,
          recommendation: 'Review emergency access logs for appropriateness',
          status: 'open'
        })
      }

      setMetrics({
        overallScore,
        categories: {
          accessControl: accessControlScore,
          auditLogging: auditLoggingScore,
          dataEncryption: dataEncryptionScore,
          userTraining: userTrainingScore,
          incidentResponse: incidentResponseScore,
          riskAssessment: riskAssessmentScore
        },
        issues,
        lastAssessment: new Date().toISOString()
      })
    } catch (err) {
      toast.error('Failed to fetch compliance metrics')
    } finally {
      setLoading(false)
    }
  }

  const calculateAccessControlScore = () => {
    // In production, this would check:
    // - MFA enforcement
    // - Password complexity
    // - Session timeout settings
    // - Role-based access control implementation
    return 85 // Placeholder
  }

  const generateComplianceReport = async () => {
    toast.loading('Generating compliance report...')
    
    // In production, this would generate a comprehensive HIPAA compliance report
    setTimeout(() => {
      toast.dismiss()
      toast.success('Compliance report generated')
      
      // Mock PDF download
      const reportData = `
HIPAA Compliance Report
Generated: ${new Date().toLocaleDateString()}

Overall Compliance Score: ${metrics?.overallScore}%

Category Scores:
- Access Control: ${metrics?.categories.accessControl}%
- Audit Logging: ${metrics?.categories.auditLogging}%
- Data Encryption: ${metrics?.categories.dataEncryption}%
- User Training: ${metrics?.categories.userTraining}%
- Incident Response: ${metrics?.categories.incidentResponse}%
- Risk Assessment: ${metrics?.categories.riskAssessment}%

Open Issues: ${metrics?.issues.filter(i => i.status === 'open').length}
      `
      
      const blob = new Blob([reportData], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `hipaa-compliance-report-${new Date().toISOString().split('T')[0]}.txt`
      a.click()
      URL.revokeObjectURL(url)
    }, 2000)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive'
      case 'high': return 'warning'
      case 'medium': return 'secondary'
      case 'low': return 'default'
      default: return 'default'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500'
    if (score >= 70) return 'text-yellow-500'
    return 'text-red-500'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-white">Loading compliance data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">HIPAA Compliance Dashboard</h1>
        <Button onClick={generateComplianceReport} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Generate Report
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 border-b border-white/10">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-2 px-4 ${activeTab === 'overview' ? 'border-b-2 border-primary text-white' : 'text-muted-foreground'}`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-2 px-4 ${activeTab === 'audit' ? 'border-b-2 border-primary text-white' : 'text-muted-foreground'}`}
        >
          Audit Logs
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-2 px-4 ${activeTab === 'reports' ? 'border-b-2 border-primary text-white' : 'text-muted-foreground'}`}
        >
          Reports
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Overall Score */}
          <Section title="Overall Compliance Score" icon={Shield}>
            <GlassCard>
              <div className="text-center space-y-4">
                <div className={`text-6xl font-bold ${getScoreColor(metrics?.overallScore || 0)}`}>
                  {metrics?.overallScore}%
                </div>
                <Progress value={metrics?.overallScore} className="h-4" />
                <p className="text-sm text-muted-foreground">
                  Last assessed: {metrics?.lastAssessment ? new Date(metrics.lastAssessment).toLocaleString() : 'Never'}
                </p>
              </div>
            </GlassCard>
          </Section>

          {/* Category Scores */}
          <Section title="Compliance Categories" icon={Activity}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {metrics && Object.entries(metrics.categories).map(([category, score]) => (
                <GlassCard key={category} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white capitalize">
                      {category.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className={`font-bold ${getScoreColor(score)}`}>
                      {score}%
                    </span>
                  </div>
                  <Progress value={score} className="h-2" />
                </GlassCard>
              ))}
            </div>
          </Section>

          {/* Compliance Issues */}
          <Section title="Active Issues" icon={AlertTriangle}>
            <GlassCard>
              {metrics?.issues.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <p className="text-white">No compliance issues detected</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {metrics?.issues.map((issue) => (
                    <div key={issue.id} className="p-4 border border-white/10 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={getSeverityColor(issue.severity) as any}>
                              {issue.severity.toUpperCase()}
                            </Badge>
                            <span className="text-sm text-muted-foreground">{issue.category}</span>
                          </div>
                          <p className="text-white">{issue.description}</p>
                          <p className="text-sm text-muted-foreground">{issue.recommendation}</p>
                        </div>
                        <Badge variant="outline">{issue.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          </Section>

          {/* Quick Actions */}
          <Section title="Quick Actions" icon={FileText}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <GlassCard className="cursor-pointer hover:bg-white/5 transition-colors">
                <div className="text-center space-y-2">
                  <Users className="h-8 w-8 text-primary mx-auto" />
                  <p className="text-white">User Access Review</p>
                </div>
              </GlassCard>
              <GlassCard className="cursor-pointer hover:bg-white/5 transition-colors">
                <div className="text-center space-y-2">
                  <Lock className="h-8 w-8 text-primary mx-auto" />
                  <p className="text-white">Security Assessment</p>
                </div>
              </GlassCard>
              <GlassCard className="cursor-pointer hover:bg-white/5 transition-colors">
                <div className="text-center space-y-2">
                  <FileText className="h-8 w-8 text-primary mx-auto" />
                  <p className="text-white">Policy Review</p>
                </div>
              </GlassCard>
              <GlassCard className="cursor-pointer hover:bg-white/5 transition-colors">
                <div className="text-center space-y-2">
                  <Activity className="h-8 w-8 text-primary mx-auto" />
                  <p className="text-white">Training Status</p>
                </div>
              </GlassCard>
            </div>
          </Section>
        </div>
      )}

      {activeTab === 'audit' && <AuditLogViewer />}

      {activeTab === 'reports' && (
        <Section title="Compliance Reports" icon={FileText}>
          <GlassCard>
            <div className="space-y-4">
              <p className="text-white">Available compliance reports:</p>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  Monthly HIPAA Compliance Report
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Security Risk Assessment
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  User Access Audit Report
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Incident Response Summary
                </Button>
              </div>
            </div>
          </GlassCard>
        </Section>
      )}
    </div>
  )
}