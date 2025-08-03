export default function AnimatedBrandLogo() {
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="450" height="450" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
        <style>
          {`
            .heartbeat {
              transform-origin: center;
              animation: beat 1.5s ease-in-out infinite;
            }

            .spin3d {
              transform-origin: center;
              animation: spin3d 5s linear forwards;
            }

            @keyframes beat {
              0% { transform: scale(1); }
              25% { transform: scale(1.05); }
              50% { transform: scale(1); }
            }

            @keyframes spin3d {
              0% { transform: rotateY(0deg); }
              100% { transform: rotateY(720deg); }
            }
          `}
        </style>

        {/* Heart Shape */}
        <path 
          className="heartbeat" 
          d="M256 420C256 420 120 340 120 240C120 180 170 140 220 160C256 180 292 160 328 160C378 160 420 200 420 240C420 340 256 420 256 420Z"
          fill="#3B82F6" 
        />

        {/* Cube Group */}
        <g className="spin3d">
          {/* Front Face */}
          <polygon points="206,190 306,190 306,290 206,290" fill="#2563EB"/>
          {/* Top Face */}
          <polygon points="206,190 256,160 356,160 306,190" fill="#3B82F6"/>
          {/* Side Face */}
          <polygon points="306,190 356,160 356,260 306,290" fill="#1D4ED8"/>
          {/* AI Label */}
          <text x="256" y="250" textAnchor="middle" fontSize="28" fill="white" fontFamily="Arial, sans-serif">AI</text>
        </g>
      </svg>
      <h1 className="text-xl font-bold text-primary mt-2">Insperity Health AI</h1>
      <p className="text-sm text-muted-foreground italic">The Synaptic Pulse</p>
    </div>
  )
}