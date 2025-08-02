import { Player } from '@lottiefiles/react-lottie-player'
import animationData from '@/assets/HeartCubePulseFinal.json'

export default function AnimatedLogoDebug() {
  console.log('Animation data loaded:', animationData)
  
  return (
    <div className="flex flex-col items-center gap-4 p-4 border border-red-500">
      <p className="text-sm text-gray-600">Debug: Logo should appear below</p>
      <div className="border border-blue-500 p-2">
        <Player
          autoplay
          loop
          src={animationData}
          style={{ height: '80px', width: '80px' }}
          onEvent={(event) => {
            console.log('Lottie event:', event)
          }}
        />
      </div>
      <p className="text-xs text-gray-500">Animation frames: {animationData?.op || 'N/A'}</p>
    </div>
  )
}