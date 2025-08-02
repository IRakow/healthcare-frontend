import AdminLayout from '@/components/layout/AdminLayout'
import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Download, UserCog, Sparkles, Star } from 'lucide-react'
import { toast } from 'sonner'
import AdminAssistantBar from '@/components/AdminAssistantBar'
import { RachelTTS } from '@/lib/voice/RachelTTS'

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'provider' | 'owner' | 'patient'
  created_at: string
  score?: number
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const [highlightedUser, setHighlightedUser] = useState<string | null>(null)

  useEffect(() => {
    const data = [
      {
        id: '1',
        name: 'Ian Rakow',
        email: 'ian@admin.com',
        role: 'owner',
        created_at: new Date().toISOString(),
        score: 98
      },
      {
        id: '2',
        name: 'Dr. Adams',
        email: 'adams@provider.com',
        role: 'provider',
        created_at: new Date().toISOString(),
        score: 91
      }
    ]
    setUsers(data)
    const top = data.reduce((prev, current) => (prev.score! > current.score! ? prev : current))
    setHighlightedUser(top.id)
  }, [])

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  const exportUsers = () => {
    const csv = [
      ['ID', 'Name', 'Email', 'Role', 'Score', 'Created At'].join(','),
      ...filtered.map(u => [u.id, u.name, u.email, u.role, u.score || '', u.created_at].join(','))
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'users.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleVoiceQuery = async (text: string) => {
    const user = users.find(u => text.toLowerCase().includes(u.name.toLowerCase()))
    
    if (text.includes('export') || text.includes('download')) {
      exportUsers()
      await RachelTTS.say('Exporting user list to CSV file. Download will start shortly.')
    } else if (text.includes('search')) {
      const searchTerm = text.split('search for')[1]?.trim() || text.split('find')[1]?.trim()
      if (searchTerm) {
        setSearch(searchTerm)
        const results = users.filter(u => 
          u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          u.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
        await RachelTTS.say(`Found ${results.length} user${results.length !== 1 ? 's' : ''} matching ${searchTerm}`)
      }
    } else if (text.includes('top') || text.includes('best') || text.includes('highest')) {
      const topUser = users.reduce((prev, current) => (prev.score! > current.score! ? prev : current))
      await RachelTTS.say(`${topUser.name} has the highest impact score of ${topUser.score}`)
    } else if (user) {
      if (text.includes('deactivate') || text.includes('remove')) {
        await RachelTTS.say(`Initiating deactivation process for ${user.name}. Please confirm in the interface.`)
        toast.error(`Deactivation initiated for ${user.email}`)
      } else {
        await RachelTTS.say(`${user.name} is a ${user.role} with email ${user.email}. ${user.score ? `Their impact score is ${user.score}.` : ''}`)
      }
    } else {
      await RachelTTS.say('You can ask about specific users, search for users, export the list, or find the top performer.')
    }
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2 text-slate-800">
            <UserCog className="w-6 h-6 text-primary" /> Manage Users
          </h1>
          <p className="text-sm text-muted-foreground">Search, export, and see who's most impactful. AI-suggested ranking is live.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={exportUsers} size="sm"><Download className="w-4 h-4 mr-2" /> Export CSV</Button>
        </div>
      </div>

      <Input
        placeholder="Search by name or email"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mt-6 max-w-md rounded-xl"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {filtered.map((user) => (
          <Card key={user.id} className={`rounded-xl bg-white/90 shadow-md p-4 space-y-2 border ${highlightedUser === user.id ? 'border-yellow-400' : ''}`}>
            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-1">
              {user.name}
              {highlightedUser === user.id && <Sparkles className="h-4 w-4 text-yellow-500 animate-pulse" />}
            </h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <Badge className="capitalize mt-1">{user.role}</Badge>
            {typeof user.score === 'number' && (
              <p className="text-xs text-sky-700 flex items-center gap-1">
                <Star className="h-3 w-3" /> Impact Score: {user.score}
              </p>
            )}
            <p className="text-xs text-gray-400">Joined: {new Date(user.created_at).toLocaleDateString()}</p>
            <div className="flex gap-2 pt-2">
              <Button size="sm" variant="outline" onClick={() => toast.info(`Opening profile for ${user.name}`)}>View</Button>
              <Button size="sm" variant="ghost" className="text-red-500" onClick={() => toast(`Deactivation initiated for ${user.email}`)}>Deactivate</Button>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground italic">No users match your search.</p>
        )}
      </div>
      <AdminAssistantBar onAsk={handleVoiceQuery} context="users" />
    </AdminLayout>
  )
}