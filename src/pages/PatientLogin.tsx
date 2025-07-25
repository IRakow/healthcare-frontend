import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export default function PatientLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { signIn } = useAuth()

  const handleLogin = async () => {
    const { error } = await signIn(email, password)
    if (error) {
      setError(error.message)
    } else {
      navigate('/patient')
    }
  }

  const handleGuestAccess = () => {
    navigate('/patient')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-xl font-semibold mb-4 text-center">Patient Login</h1>
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border rounded mb-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border rounded mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        <button
          className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 mb-3"
          onClick={handleLogin}
        >
          Login
        </button>
        <div className="text-center">
          <span className="text-gray-600 text-sm">Don't have an account?</span>
          <button
            className="w-full mt-2 bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300"
            onClick={handleGuestAccess}
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  )
}