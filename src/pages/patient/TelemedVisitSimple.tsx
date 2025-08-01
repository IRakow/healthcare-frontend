// src/pages/patient/TelemedVisit.tsx

import PatientLayout from '@/components/layout/PatientLayout'
import { Video, Mic, MicOff, PhoneOff } from 'lucide-react'
import { useState } from 'react'

export default function TelemedVisitSimple() {
  const [muted, setMuted] = useState(false)

  return (
    <PatientLayout>
      <div className="w-full h-[80vh] bg-black rounded-2xl overflow-hidden shadow-xl relative flex items-center justify-center">
        <div className="absolute top-4 left-4 text-white text-sm">Dr. Patel (Dermatology)</div>

        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-4">
          <button onClick={() => setMuted(!muted)} className="bg-white/20 backdrop-blur text-white p-3 rounded-full hover:bg-white/30 transition">
            {muted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <button className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full transition">
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>

        <div className="text-white/40 text-xs absolute bottom-2 right-4">Stream is simulated</div>
      </div>
    </PatientLayout>
  )
}