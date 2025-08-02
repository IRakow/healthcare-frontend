import { Player } from '@lottiefiles/react-lottie-player'
import testData from '@/assets/testLottie.json' // use any working fallback
import heartbeatAudio from '@/assets/audio/realistic_heartbeat_sequence.mp3'
import { useEffect, useRef } from 'react'

export default function AnimatedLogoWithSound() {
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const timeout = setTimeout(() => {
      audioRef.current?.play().catch(() => {
        // Silent catch for autoplay restrictions
      })
    }, 300) // slight sync delay

    return () => clearTimeout(timeout)
  }, [])

  return (
    <div className="flex justify-center items-center">
      <Player
        autoplay
        loop
        src={testData}
        style={{ height: 200, width: 200 }}
      />
      <audio ref={audioRef} src={heartbeatAudio} preload="auto" />
    </div>
  )
}