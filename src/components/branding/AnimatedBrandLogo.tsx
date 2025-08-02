import { useEffect, useRef } from 'react'
import gsap from 'gsap'

export default function AnimatedBrandLogo() {
  const heartRef = useRef<SVGPathElement>(null)
  const cubeRef = useRef<SVGRectElement>(null)

  useEffect(() => {
    // Heartbeat pulse (5x)
    gsap.to(heartRef.current, {
      scale: 1.05,
      transformOrigin: 'center',
      repeat: 4,
      yoyo: true,
      duration: 0.5,
      ease: 'power1.inOut',
    })

    // AI Cube spin (720°)
    gsap.to(cubeRef.current, {
      rotation: 720,
      transformOrigin: 'center',
      duration: 5,
      ease: 'power2.inOut',
    })
  }, [])

  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
        width="140"
        height="140"
        className="drop-shadow-lg"
      >
        <path
          ref={heartRef}
          id="heart"
          fill="#E53935"
          d="M256 464l-20-20C120 328 48 256 48 160 48 96 96 48 160 48c40 0 80 24 96 60 16-36 56-60 96-60 64 0 112 48 112 112 0 96-72 168-188 284l-20 20z"
        />
        <rect
          ref={cubeRef}
          id="cube"
          x="206"
          y="206"
          width="100"
          height="100"
          rx="12"
          fill="#1E88E5"
        />
      </svg>
      <h1 className="text-xl font-bold text-primary mt-2">Insperity Health AI</h1>
      <p className="text-sm text-muted-foreground italic">The Synaptic Pulse</p>
    </div>
  )
}