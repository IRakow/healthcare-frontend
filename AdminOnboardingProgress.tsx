// File: admin/AdminOnboardingProgress.tsx
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, THead, TBody, Tr, Th, Td } from '@/components/ui/table'
import { Loader2 } from 'lucide-react'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
)

export default function AdminOnboardingProgress() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProgress = async () => {
      const { data } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name, email, onboarding_status, onboarding_step, onboarding_started_at, onboarding_completed_at')
        .order('onboarding_status', { ascending: false })
      setUsers(data || [])
      setLoading(false)
    }
    fetchProgress()
  }, [])

  if (loading) return <Loader2 className="m-4 animate-spin" />

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">🚀 Onboarding Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <THead>
            <Tr>
              <Th>Name</Th>
              <Th>Status</Th>
              <Th>Step</Th>
              <Th>Started</Th>
              <Th>Completed</Th>
            </Tr>
          </THead>
          <TBody>
            {users.map(u => (
              <Tr key={u.id}>
                <Td>{u.first_name} {u.last_name}</Td>
                <Td>{u.onboarding_status}</Td>
                <Td>{u.onboarding_step || '-'}</Td>
                <Td>{u.onboarding_started_at ? new Date(u.onboarding_started_at).toLocaleString() : '-'}</Td>
                <Td>{u.onboarding_completed_at ? new Date(u.onboarding_completed_at).toLocaleString() : '-'}</Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </CardContent>
    </Card>
  )
}
