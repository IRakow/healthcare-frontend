import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import AdminLayout from '@/layouts/AdminLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RefreshCw, Send, Megaphone, Users, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'

interface BroadcastMessage {
  id: string
  message: string
  target: 'all' | 'admins' | 'providers' | 'patients'
  created_at: string
  sent_by: string
}

export default function AdminBroadcastPage() {
  const [history, setHistory] = useState<BroadcastMessage[]>([])
  const [message, setMessage] = useState('')
  const [target, setTarget] = useState<'all' | 'admins' | 'providers' | 'patients'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('broadcasts').select('*').order('created_at', { ascending: false })
    if (!error && data) setHistory(data)
    setLoading(false)
  }

  const sendMessage = async () => {
    if (!message.trim()) return

    const { data, error } = await supabase.from('broadcasts').insert({
      message,
      target,
      sent_by: 'System Admin'
    })

    if (!error) {
      setMessage('')
      fetchMessages()
    }
  }

  return (
    <AdminLayout>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-extrabold text-yellow-800 flex items-center gap-3">
                <Megaphone className="w-7 h-7 text-yellow-600" /> Broadcast Center
              </h1>
              <p className="text-sm text-muted-foreground mt-1">Send important messages to groups of users.</p>
            </div>
            <Button onClick={fetchMessages} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-1" /> Refresh
            </Button>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg p-6 space-y-4">
            <Textarea
              placeholder="Type your broadcast message here..."
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full rounded-xl shadow-inner"
            />
            <div className="flex gap-3 items-center">
              <label className="text-sm font-medium text-gray-600">Target:</label>
              <select
                value={target}
                onChange={(e) => setTarget(e.target.value as any)}
                className="px-3 py-2 rounded-lg border border-gray-300 shadow-sm text-sm"
              >
                <option value="all">All Users</option>
                <option value="admins">Admins</option>
                <option value="providers">Providers</option>
                <option value="patients">Patients</option>
              </select>
              <Button onClick={sendMessage} size="sm" className="ml-auto">
                <Send className="w-4 h-4 mr-1" /> Send
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-yellow-800 flex items-center gap-2">
              <Users className="w-5 h-5" /> Message History
            </h2>
            <div className="space-y-2">
              {history.map((msg) => (
                <div
                  key={msg.id}
                  className="bg-white border border-yellow-200 rounded-xl px-4 py-3 shadow-sm"
                >
                  <div className="text-sm text-gray-800 mb-1">{msg.message}</div>
                  <div className="text-xs text-gray-500 flex items-center justify-between">
                    <span>Target: {msg.target}</span>
                    <span>By: {msg.sent_by} — {format(new Date(msg.created_at), 'PPpp')}</span>
                  </div>
                </div>
              ))}
              {history.length === 0 && (
                <div className="text-sm text-muted-foreground italic flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" /> No messages have been sent yet.
                </div>
              )}
            </div>
          </div>
    </AdminLayout>
  )
}