import { useNavigate } from 'react-router-dom'

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            AI Healthcare Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Transforming healthcare with AI-powered insights and personalized care
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {/* Admin Login Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🏢</span>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800">Platform Admin</h2>
            </div>
            <p className="text-gray-600 mb-6 text-center">
              Manage employers, billing, and system settings
            </p>
            <button
              onClick={() => navigate('/admin/login')}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Admin Login
            </button>
          </div>

          {/* Owner Login Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💼</span>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800">Employer Portal</h2>
            </div>
            <p className="text-gray-600 mb-6 text-center">
              Manage employees, view analytics, and configure benefits
            </p>
            <button
              onClick={() => navigate('/owner/login')}
              className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Employer Login
            </button>
          </div>

          {/* Patient Login Card */}
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">👤</span>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800">Patient Portal</h2>
            </div>
            <p className="text-gray-600 mb-6 text-center">
              Access your health records, book appointments, and chat with AI
            </p>
            <button
              onClick={() => navigate('/patient/login')}
              className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Patient Login
            </button>
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-gray-500">
            Powered by AI • HIPAA Compliant • Secure & Private
          </p>
        </div>
      </div>
    </div>
  )
}