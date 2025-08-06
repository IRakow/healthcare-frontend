import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw, Download, HardDrive, AlertCircle, Timer } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { toast } from 'sonner'
import AdminAssistantBar from '@/components/AdminAssistantBar'
import { speak } from '@/lib/voice/RachelTTSQueue'

interface BackupEntry {
  id: string
  timestamp: string
  size: string
  status: 'complete' | 'in_progress' | 'failed'
  initiated_by: string
  expires_in?: string
}

export default function AdminBackupPage() {
  const [backups, setBackups] = useState<BackupEntry[]>([
    {
      id: 'backup_001',
      timestamp: new Date().toISOString(),
      size: '1.9 GB',
      status: 'complete',
      initiated_by: 'System',
      expires_in: '7 days'
    }
  ])

  const triggerBackup = () => {
    const newBkp: BackupEntry = {
      id: `backup_${Date.now()}`,
      timestamp: new Date().toISOString(),
      size: 'pending',
      status: 'in_progress',
      initiated_by: 'Admin',
      expires_in: '7 days'
    }
    setBackups([newBkp, ...backups])
    toast.success('Backup process started and will complete in a few minutes.')
  }

  const handleVoiceQuery = async (text: string) => {
    if (text.includes('trigger') || text.includes('create') || text.includes('new backup')) {
      triggerBackup()
      speak('Starting new backup process. It will complete in a few minutes.')
    } else if (text.includes('recent') || text.includes('latest')) {
      const latest = backups[0]
      if (latest) {
        speak(`Most recent backup was ${formatDistanceToNow(new Date(latest.timestamp), { addSuffix: true })}. Size: ${latest.size}. Status: ${latest.status}.`)
      } else {
        speak('No backups available yet.')
      }
    } else if (text.includes('failed') || text.includes('error')) {
      const failed = backups.filter(b => b.status === 'failed')
      if (failed.length > 0) {
        speak(`There ${failed.length === 1 ? 'is' : 'are'} ${failed.length} failed backup${failed.length !== 1 ? 's' : ''}.`)
      } else {
        speak('All backups completed successfully.')
      }
    } else if (text.includes('expir')) {
      const expiringSoon = backups.filter(b => b.expires_in && b.expires_in.includes('1 day') || b.expires_in?.includes('0 day'))
      if (expiringSoon.length > 0) {
        speak(`Warning: ${expiringSoon.length} backup${expiringSoon.length > 1 ? 's are' : ' is'} expiring soon.`)
      } else {
        speak('No backups are expiring soon.')
      }
    } else if (text.includes('download')) {
      speak('To download a backup, click the download button next to the backup you want.')
    } else {
      speak('You can trigger a new backup, check recent backups, view failed backups, or check expiration status.')
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2 text-slate-800">
            <HardDrive className="w-6 h-6 text-primary" /> System Backups
          </h1>
          <p className="text-sm text-muted-foreground">Trigger smart backups, track expiry, and get notified when backups are stale.</p>
        </div>
        <Button onClick={triggerBackup}><RefreshCw className="w-4 h-4 mr-1" /> Trigger Backup</Button>
      </div>

      <div className="mt-6 space-y-4">
        {backups.map(bkp => (
          <Card key={bkp.id} className="p-4 border bg-white/90 rounded-xl">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold text-slate-800">{bkp.id}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(bkp.timestamp), { addSuffix: true })} • Initiated by {bkp.initiated_by}
                </p>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <Timer className="w-3 h-3" /> Expires in {bkp.expires_in}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-gray-600">
                  Status: <span className={`capitalize ${
                    bkp.status === 'complete' ? 'text-green-500' : bkp.status === 'in_progress' ? 'text-yellow-500' : 'text-red-500'}`}>{bkp.status}</span>
                </p>
                <p className="text-xs text-gray-400">Size: {bkp.size}</p>
                <Button variant="secondary" size="sm" className="mt-1"><Download className="w-3 h-3 mr-1" /> Download</Button>
              </div>
            </div>
          </Card>
        ))}
        {backups.length === 0 && (
          <p className="text-sm text-muted-foreground italic flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-gray-400" /> No backups available yet.
          </p>
        )}
      </div>
      <AdminAssistantBar onAsk={handleVoiceQuery} context="backup" />
    </div>
  )
}