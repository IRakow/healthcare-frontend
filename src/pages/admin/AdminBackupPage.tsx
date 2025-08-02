import { useEffect, useState } from 'react'
import AdminLayout from '@/layouts/AdminLayout'
import { Button } from '@/components/ui/button'
import { RefreshCw, Download, ShieldCheck, HardDrive, FileText, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'

interface BackupEntry {
  id: string
  created_at: string
  size: string
  status: 'completed' | 'in_progress' | 'failed'
  triggered_by: string
}

export default function AdminBackupPage() {
  const [backups, setBackups] = useState<BackupEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [triggering, setTriggering] = useState(false)

  useEffect(() => {
    fetchBackups()
  }, [])

  const fetchBackups = async () => {
    setLoading(true)
    const mock: BackupEntry[] = [
      {
        id: 'bkp1',
        created_at: new Date().toISOString(),
        size: '2.3 GB',
        status: 'completed',
        triggered_by: 'System Auto'
      },
      {
        id: 'bkp2',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        size: '2.1 GB',
        status: 'completed',
        triggered_by: 'Admin Manual'
      }
    ]
    setTimeout(() => {
      setBackups(mock)
      setLoading(false)
    }, 600)
  }

  const triggerBackup = async () => {
    setTriggering(true)
    setTimeout(() => {
      const newBackup: BackupEntry = {
        id: `bkp-${Date.now()}`,
        created_at: new Date().toISOString(),
        size: 'Pending',
        status: 'in_progress',
        triggered_by: 'You'
      }
      setBackups(prev => [newBackup, ...prev])
      setTriggering(false)
    }, 1000)
  }

  return (
    <AdminLayout>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-extrabold text-slate-800 flex items-center gap-3">
                <HardDrive className="w-7 h-7 text-primary" /> Backups
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Review system backups and manually trigger exports.</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={fetchBackups} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-1" /> Refresh
              </Button>
              <Button onClick={triggerBackup} size="sm" disabled={triggering}>
                <ShieldCheck className="w-4 h-4 mr-1" /> {triggering ? 'Processing...' : 'Trigger Backup'}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {backups.map((bkp) => (
              <div
                key={bkp.id}
                className="bg-white border border-gray-200 rounded-xl px-5 py-4 shadow-sm flex items-start justify-between"
              >
                <div>
                  <div className="text-sm font-medium text-gray-800 mb-1">
                    Backup ID: <span className="font-mono text-blue-700">{bkp.id}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Created: {format(new Date(bkp.created_at), 'PPpp')} • Triggered by: {bkp.triggered_by}
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <div className="text-xs">
                    <span className="font-semibold">Status:</span> <span className={
                      bkp.status === 'completed' ? 'text-green-600' : bkp.status === 'in_progress' ? 'text-yellow-600' : 'text-red-600'
                    }>{bkp.status}</span>
                  </div>
                  <div className="text-xs text-gray-500">Size: {bkp.size}</div>
                  <Button variant="secondary" size="sm" className="mt-2">
                    <Download className="w-3 h-3 mr-1" /> Download
                  </Button>
                </div>
              </div>
            ))}
            {backups.length === 0 && (
              <div className="text-sm text-muted-foreground italic flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-gray-500" /> No backups available yet.
              </div>
            )}
          </div>
    </AdminLayout>
  )
}