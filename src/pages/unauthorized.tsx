// File: src/pages/unauthorized.tsx
import { Link } from 'react-router-dom'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center p-6 text-center">
      <h1 className="text-4xl font-bold mb-4">🚫 Access Denied</h1>
      <p className="text-md text-muted-foreground mb-6">
        You do not have permission to view this page. If you believe this is a mistake, please contact your administrator.
      </p>
      <Link to="/">
        <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded shadow">
          Go to Homepage
        </button>
      </Link>
    </div>
  )
}