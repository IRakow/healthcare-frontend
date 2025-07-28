// File: src/components/provider/LiveVideoVisit.tsx
import { useEffect, useState } from 'react'
import { useUser } from '@/hooks/useUser'
import { supabase } from '@/lib/supabase'

export function LiveVideoVisit() {
  const { name, role, userId } = useUser()
  const [roomUrl, setRoomUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [joined, setJoined] = useState(false)

  const createRoom = async () => {
    setLoading(true)
    const visitId = `visit-${userId}-${Date.now()}`
    const url = `https://insperity-video.vercel.app/room/${visitId}`
    setRoomUrl(url)

    await supabase.from('timeline').insert({
      user_id: userId,
      label: `Started video visit as ${role}`,
      event_time: new Date().toISOString(),
    })

    setJoined(true)
    setLoading(false)
  }

  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 text-white space-y-4">
      <h2 className="text-xl font-bold">Live Telemedicine Room</h2>

      {!joined ? (
        <button
          onClick={createRoom}
          className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded shadow"
          disabled={loading}
        >
          {loading ? 'Launching...' : 'Join Video Call'}
        </button>
      ) : (
        <iframe
          src={roomUrl}
          allow="camera; microphone; display-capture"
          className="w-full aspect-video rounded-xl border"
        />
      )}
    </div>
  )
}