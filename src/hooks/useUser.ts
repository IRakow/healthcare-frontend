import { useSession } from '@supabase/auth-helpers-react'

export function useUser() {
  const session = useSession()
  const role = session?.user?.user_metadata?.role || 'guest'
  const userId = session?.user?.id || ''
  const name = session?.user?.user_metadata?.full_name || session?.user?.email || 'User'
  
  return { userId, role, name }
}