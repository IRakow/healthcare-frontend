import { useNavigate } from 'react-router-dom'
import { User, Stethoscope, Building2, UserCog } from 'lucide-react'
import AnimatedLogoWithSound from '@/components/branding/AnimatedLogoWithSound'

export default function SimpleLogin() {
  const navigate = useNavigate()

  const roles = [
    {
      name: 'Patient',
      icon: <User className="w-12 h-12" />,
      color: 'from-purple-500 to-purple-700',
      hoverColor: 'hover:from-purple-600 hover:to-purple-800',
      route: '/patient/dashboard',
      description: 'Access your health records and AI assistant'
    },
    {
      name: 'Provider',
      icon: <Stethoscope className="w-12 h-12" />,
      color: 'from-blue-500 to-blue-700',
      hoverColor: 'hover:from-blue-600 hover:to-blue-800',
      route: '/provider/dashboard',
      description: 'Manage patients and clinical tools'
    },
    {
      name: 'Owner/Employer',
      icon: <Building2 className="w-12 h-12" />,
      color: 'from-green-500 to-green-700',
      hoverColor: 'hover:from-green-600 hover:to-green-800',
      route: '/owner/dashboard',
      description: 'View analytics and manage organization'
    },
    {
      name: 'Admin',
      icon: <UserCog className="w-12 h-12" />,
      color: 'from-red-500 to-red-700',
      hoverColor: 'hover:from-red-600 hover:to-red-800',
      route: '/admin/dashboard',
      description: 'System administration and settings'
    }
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-6xl w-full px-4">
        <div className="flex justify-center my-4">
          <AnimatedLogoWithSound />
        </div>
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">Insperity Health AI</h1>
          <p className="text-xl text-gray-300">Select your portal to continue</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map((role) => (
            <button
              key={role.name}
              onClick={() => navigate(role.route)}
              className={`group relative overflow-hidden rounded-2xl p-8 text-white shadow-xl transition-all duration-300 transform hover:scale-105 bg-gradient-to-br ${role.color} ${role.hoverColor}`}
            >
              <div className="relative z-10 flex flex-col items-center space-y-4">
                <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
                  {role.icon}
                </div>
                <h3 className="text-2xl font-bold">{role.name}</h3>
                <p className="text-sm text-white/90 text-center">{role.description}</p>
              </div>
              
              {/* Animated background effect */}
              <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}