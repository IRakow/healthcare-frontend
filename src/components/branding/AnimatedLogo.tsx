import { Player } from '@lottiefiles/react-lottie-player'
import animationData from '@/assets/HeartCubePulseFinal.json'

export default function AnimatedLogo() {
  return (
    <div className="flex justify-center items-center">
      <Player
        autoplay
        keepLastFrame
        speed={1}
        src={animationData}
        style={{ height: '5rem', width: '5rem' }} // ~golf ball size
      />
    </div>
  )
}