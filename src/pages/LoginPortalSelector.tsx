import * as React from "react"
import { useNavigate } from "react-router-dom"
import { Mic, User, ShieldCheck, Stethoscope, Briefcase } from "lucide-react"

export default function LoginPortalSelector() {
  const navigate = useNavigate()

  const portals = [
    {
      name: "Patient Portal",
      description: "Access your health records, appointments, and AI assistant.",
      icon: <User className="w-6 h-6 mr-2" />,
      path: "/login/patient"
    },
    {
      name: "Provider Portal",
      description: "Manage patients, records, and clinical tools.",
      icon: <Stethoscope className="w-6 h-6 mr-2" />,
      path: "/login/provider"
    },
    {
      name: "Admin Portal",
      description: "Control users, logs, and platform operations.",
      icon: <ShieldCheck className="w-6 h-6 mr-2" />,
      path: "/login/admin"
    },
    {
      name: "Owner Portal",
      description: "Access billing, employer config, and invoices.",
      icon: <Briefcase className="w-6 h-6 mr-2" />,
      path: "/login/owner"
    }
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-gray-800 px-6">
      <div className="max-w-4xl w-full text-white">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">Welcome to Insperity Health AI</h1>
          <p className="text-gray-300 text-lg">Please choose your login portal</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {portals.map(({ name, description, icon, path }) => (
            <button
              key={name}
              onClick={() => navigate(path)}
              className="flex flex-col items-start justify-start p-6 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md shadow-xl text-left transition-all hover:scale-105 hover:bg-white/20 hover:border-white/30"
            >
              <div className="flex items-center text-xl font-semibold mb-2">
                {icon}
                {name}
              </div>
              <p className="text-sm text-gray-300">{description}</p>
            </button>
          ))}
        </div>

        {/* Voice Assistant Button */}
        <div className="mt-10 flex justify-center">
          <button
            onClick={() => {
              // Trigger Deepgram + ElevenLabs voice input (stub)
              alert("Voice assistant coming soon!")
            }}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-teal-600 hover:bg-teal-700 transition text-white shadow-lg"
          >
            <Mic className="w-5 h-5" />
            Ask the AI Assistant
          </button>
        </div>
      </div>
    </div>
  )
}