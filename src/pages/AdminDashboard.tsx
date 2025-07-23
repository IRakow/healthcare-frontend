// File: admin/AdminDashboard.tsx
import AdminOnboardingProgress from './AdminOnboardingProgress'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
)

export default function AdminDashboard() {
  const [loading, setLoading] = useState(false)

  return (
    <div className="space-y-6 px-4 py-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <AdminOnboardingProgress />
    </div>
  )
}
