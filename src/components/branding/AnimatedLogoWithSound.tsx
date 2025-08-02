import { Player } from '@lottiefiles/react-lottie-player'
import animationData from '@/assets/HeartCubePulseFinal.json'
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
        speed={1}
        src={animationData}
        style={{ height: '5rem', width: '5rem' }}
      />
      <audio ref={audioRef} src={heartbeatAudio} preload="auto" />
    </div>
  )
}