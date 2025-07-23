import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import supabase from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import AdminSidebar from '@/components/admin/AdminSidebar'
import VoiceAssistant from '@/components/voice/DeepgramAssistant'
import {
  Database,
  Download,
  Upload,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  HardDrive,
  Shield,
  RefreshCw,
  Play,
  Pause,
  Settings,
  FileText,
  Archive,
  Cloud,
  Zap,
  TrendingUp,
  Info,
  XCircle,
  Server,
  BarChart3
} from 'lucide-react'

interface BackupItem {
  id: string
  date: string
  file: string
  size: string
  type: 'manual' | 'scheduled' | 'automated'
  status: 'completed' | 'in_progress' | 'failed' | 'verified'
  duration: string
  tables: number
  records: number
  notes: string
  verification?: {
    status: 'verified' | 'unverified' | 'failed'
    checksum: string
    verifiedAt?: string
  }
}

interface BackupSchedule {
  id: string
  name: string
  frequency: 'daily' | 'weekly' | 'monthly'
  time: string
  lastRun: string
  nextRun: string
  status: 'active' | 'paused'
  retention: number // days to keep
}

interface SystemHealth {
  databaseSize: string
  growthRate: string
  lastBackup: string
  backupHealth: number
  storageUsed: string
  storageLimit: string
}

export default function Backup() {
  const [backups, setBackups] = useState<BackupItem[]>([])
  const [schedules, setSchedules] = useState<BackupSchedule[]>([])
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    databaseSize: '2.4 GB',
    growthRate: '+12.5%',
    lastBackup: new Date().toISOString(),
    backupHealth: 98,
    storageUsed: '45.2 GB',
    storageLimit: '100 GB'
  })
  const [loading, setLoading] = useState(true)
  const [backupInProgress, setBackupInProgress] = useState(false)
  const [selectedBackup, setSelectedBackup] = useState<BackupItem | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    checkAuth()
    loadBackupData()
    const interval = setInterval(loadBackupData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      navigate('/admin/login')
      return
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      navigate('/')
    }
  }

  const loadBackupData = async () => {
    try {
      // Mock backup data - in production, this would come from your backups table
      const mockBackups: BackupItem[] = [
        {
          id: '1',
          date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          file: 'backup-2025-07-23-1000.zip',
          size: '2.4 GB',
          type: 'scheduled',
          status: 'verified',
          duration: '5m 23s',
          tables: 24,
          records: 125847,
          notes: 'Daily scheduled backup',
          verification: {
            status: 'verified',
            checksum: 'SHA256:a8f5f167f44f4964e6c998dee',
            verifiedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
          }
        },
        {
          id: '2',
          date: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
          file: 'backup-2025-07-22-1000.zip',
          size: '2.3 GB',
          type: 'scheduled',
          status: 'completed',
          duration: '5m 18s',
          tables: 24,
          records: 124532,
          notes: 'Daily scheduled backup',
          verification: {
            status: 'verified',
            checksum: 'SHA256:b7e4c123d89f2a8c5f6d789b',
            verifiedAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString()
          }
        },
        {
          id: '3',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          file: 'backup-2025-07-20-manual.zip',
          size: '2.2 GB',
          type: 'manual',
          status: 'completed',
          duration: '4m 56s',
          tables: 24,
          records: 122103,
          notes: 'Manual backup before system update'
        },
        {
          id: '4',
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          file: 'backup-2025-07-16-1000.zip',
          size: '2.1 GB',
          type: 'scheduled',
          status: 'completed',
          duration: '4m 45s',
          tables: 24,
          records: 119847,
          notes: 'Weekly full backup'
        }
      ]

      const mockSchedules: BackupSchedule[] = [
        {
          id: '1',
          name: 'Daily Backup',
          frequency: 'daily',
          time: '10:00 AM',
          lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          nextRun: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          retention: 7
        },
        {
          id: '2',
          name: 'Weekly Full Backup',
          frequency: 'weekly',
          time: 'Sunday 2:00 AM',
          lastRun: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          nextRun: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          retention: 30
        },
        {
          id: '3',
          name: 'Monthly Archive',
          frequency: 'monthly',
          time: '1st day, 3:00 AM',
          lastRun: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000).toISOString(),
          nextRun: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'active',
          retention: 365
        }
      ]

      setBackups(mockBackups)
      setSchedules(mockSchedules)
      setLoading(false)
    } catch (error) {
      console.error('Error loading backup data:', error)
      setLoading(false)
    }
  }

  const startManualBackup = async () => {
    setBackupInProgress(true)
    // Simulate backup process
    setTimeout(() => {
      setBackupInProgress(false)
      loadBackupData() // Refresh data
    }, 5000)
  }

  const verifyBackup = async (backup: BackupItem) => {
    // Simulate verification process
    console.log('Verifying backup:', backup.file)
  }

  const restoreBackup = async (backup: BackupItem) => {
    if (confirm(`Are you sure you want to restore from ${backup.file}? This will overwrite current data.`)) {
      console.log('Restoring backup:', backup.file)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)
    
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return formatDate(dateString)
  }

  const getStatusColor = (status: BackupItem['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700'
      case 'verified': return 'bg-blue-100 text-blue-700'
      case 'in_progress': return 'bg-yellow-100 text-yellow-700'
      case 'failed': return 'bg-red-100 text-red-700'
    }
  }

  const getTypeIcon = (type: BackupItem['type']) => {
    switch (type) {
      case 'manual': return <Play className="h-4 w-4" />
      case 'scheduled': return <Clock className="h-4 w-4" />
      case 'automated': return <Zap className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Database className="h-8 w-8 text-blue-600" />
                Backup Management
              </h1>
              <p className="text-sm text-gray-500 mt-1">Manage system backups and recovery points</p>
            </div>
            <div className="flex gap-3">
              <VoiceAssistant context="admin-backup" />
              <button
                onClick={() => navigate('/admin/settings')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* System Health */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <HardDrive className="h-4 w-4" />
                  Database Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Size</span>
                    <span className="text-sm font-medium">{systemHealth.databaseSize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Growth</span>
                    <span className="text-sm font-medium text-green-600">{systemHealth.growthRate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Last Backup</span>
                    <span className="text-sm font-medium">{formatTimeAgo(systemHealth.lastBackup)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Backup Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-2xl font-bold text-green-600">{systemHealth.backupHealth}%</div>
                  <Progress value={systemHealth.backupHealth} className="h-2" />
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-gray-600">All systems operational</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Cloud className="h-4 w-4" />
                  Storage Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Used</span>
                    <span className="font-medium">{systemHealth.storageUsed} / {systemHealth.storageLimit}</span>
                  </div>
                  <Progress value={45.2} className="h-2" />
                  <div className="text-xs text-gray-500">54.8 GB available</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="backups" className="space-y-4">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="backups">Backups</TabsTrigger>
              <TabsTrigger value="schedules">Schedules</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Backups Tab */}
            <TabsContent value="backups" className="space-y-4">
              {/* Action Bar */}
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Recent Backups</h2>
                <div className="flex gap-3">
                  <button
                    onClick={startManualBackup}
                    disabled={backupInProgress}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      backupInProgress 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {backupInProgress ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Backing up...
                      </>
                    ) : (
                      <>
                        <Database className="h-4 w-4" />
                        Create Backup
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Backup Progress Alert */}
              {backupInProgress && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Backup in progress... This may take several minutes depending on database size.
                  </AlertDescription>
                </Alert>
              )}

              {/* Backups Table */}
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Backup
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Size
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Details
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {backups.map((backup) => (
                          <tr key={backup.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{backup.file}</div>
                                <div className="text-sm text-gray-500">{formatDate(backup.date)}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                {getTypeIcon(backup.type)}
                                <span className="text-sm text-gray-900 capitalize">{backup.type}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {backup.size}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge className={`${getStatusColor(backup.status)} border-0`}>
                                {backup.status}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600">
                                <div>{backup.tables} tables • {backup.records.toLocaleString()} records</div>
                                <div className="text-xs text-gray-500">Duration: {backup.duration}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setSelectedBackup(backup)}
                                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                                  title="View details"
                                >
                                  <Info className="h-4 w-4 text-gray-600" />
                                </button>
                                <button
                                  onClick={() => verifyBackup(backup)}
                                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                                  title="Verify backup"
                                >
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                </button>
                                <button
                                  onClick={() => restoreBackup(backup)}
                                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                                  title="Restore backup"
                                >
                                  <Upload className="h-4 w-4 text-blue-600" />
                                </button>
                                <a
                                  href={`/api/backups/download/${backup.file}`}
                                  className="p-1 hover:bg-gray-100 rounded transition-colors inline-block"
                                  title="Download backup"
                                >
                                  <Download className="h-4 w-4 text-gray-600" />
                                </a>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Backup Details Modal */}
              {selectedBackup && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Backup Details: {selectedBackup.file}</span>
                      <button
                        onClick={() => setSelectedBackup(null)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm text-gray-500">Created</div>
                        <div className="font-medium">{formatDate(selectedBackup.date)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Duration</div>
                        <div className="font-medium">{selectedBackup.duration}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Size</div>
                        <div className="font-medium">{selectedBackup.size}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Type</div>
                        <div className="font-medium capitalize">{selectedBackup.type}</div>
                      </div>
                    </div>
                    {selectedBackup.verification && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm font-medium mb-2">Verification Details</div>
                        <div className="space-y-1 text-sm">
                          <div>Status: <Badge className={selectedBackup.verification.status === 'verified' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>{selectedBackup.verification.status}</Badge></div>
                          <div>Checksum: <code className="text-xs bg-gray-200 px-1 rounded">{selectedBackup.verification.checksum}</code></div>
                          {selectedBackup.verification.verifiedAt && (
                            <div>Verified: {formatDate(selectedBackup.verification.verifiedAt)}</div>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="mt-4">
                      <div className="text-sm text-gray-500">Notes</div>
                      <div className="text-sm">{selectedBackup.notes}</div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Schedules Tab */}
            <TabsContent value="schedules" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Backup Schedules</h2>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <Plus className="h-4 w-4" />
                  Add Schedule
                </button>
              </div>

              <div className="grid gap-4">
                {schedules.map((schedule) => (
                  <Card key={schedule.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-medium">{schedule.name}</h3>
                            <Badge variant={schedule.status === 'active' ? 'default' : 'secondary'}>
                              {schedule.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span className="capitalize">{schedule.frequency} at {schedule.time}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Archive className="h-4 w-4" />
                              <span>Retention: {schedule.retention} days</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Last run:</span> {formatTimeAgo(schedule.lastRun)}
                            </div>
                            <div>
                              <span className="text-gray-500">Next run:</span> {formatDate(schedule.nextRun)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            {schedule.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                          </button>
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Settings className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Backup Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Storage Settings</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="text-sm text-gray-600">Storage Location</label>
                          <select className="px-3 py-1 border rounded-md text-sm">
                            <option>Local Storage</option>
                            <option>AWS S3</option>
                            <option>Google Cloud Storage</option>
                          </select>
                        </div>
                        <div className="flex justify-between items-center">
                          <label className="text-sm text-gray-600">Compression Level</label>
                          <select className="px-3 py-1 border rounded-md text-sm">
                            <option>High (Slower)</option>
                            <option>Medium</option>
                            <option>Low (Faster)</option>
                          </select>
                        </div>
                        <div className="flex justify-between items-center">
                          <label className="text-sm text-gray-600">Encryption</label>
                          <input type="checkbox" defaultChecked className="rounded" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Retention Policy</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="text-sm text-gray-600">Daily Backups</label>
                          <select className="px-3 py-1 border rounded-md text-sm">
                            <option>Keep for 7 days</option>
                            <option>Keep for 14 days</option>
                            <option>Keep for 30 days</option>
                          </select>
                        </div>
                        <div className="flex justify-between items-center">
                          <label className="text-sm text-gray-600">Weekly Backups</label>
                          <select className="px-3 py-1 border rounded-md text-sm">
                            <option>Keep for 30 days</option>
                            <option>Keep for 60 days</option>
                            <option>Keep for 90 days</option>
                          </select>
                        </div>
                        <div className="flex justify-between items-center">
                          <label className="text-sm text-gray-600">Monthly Backups</label>
                          <select className="px-3 py-1 border rounded-md text-sm">
                            <option>Keep for 1 year</option>
                            <option>Keep for 2 years</option>
                            <option>Keep forever</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h3 className="text-sm font-medium mb-4">Notifications</h3>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className="text-sm">Email notifications for backup failures</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" defaultChecked className="rounded" />
                        <span className="text-sm">Weekly backup summary reports</span>
                      </label>
                      <label className="flex items-center gap-3">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">SMS alerts for critical failures</span>
                      </label>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Save Settings
                    </button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Backup Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold">156</div>
                      <div className="text-sm text-gray-500">Total Backups</div>
                    </div>
                    <div className="text-center">
                      <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold">99.8%</div>
                      <div className="text-sm text-gray-500">Success Rate</div>
                    </div>
                    <div className="text-center">
                      <Server className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold">45.2 GB</div>
                      <div className="text-sm text-gray-500">Total Storage Used</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}