// src/pages/Login.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
    } else {
      navigate('/patient') // You can redirect by role later
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
      <form onSubmit={handleLogin} className="bg-white shadow-lg p-8 rounded-xl w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center text-blue-700">Login</h1>

        {error && <div className="text-red-600 text-sm">{error}</div>}

        <input
          type="email"
          className="w-full border border-gray-300 p-2 rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          className="w-full border border-gray-300 p-2 rounded"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Sign In
        </button>
      </form>
    </div>
  )
}
