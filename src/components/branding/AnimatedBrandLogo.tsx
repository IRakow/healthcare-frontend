export default function AnimatedBrandLogo() {
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="450" height="450" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
        <style>
          {`
            .spin3d {
              transform-origin: 50% 50%;
              animation: spin3d 5s ease-in-out 1 forwards;
            }

            @keyframes spin3d {
              0%   { transform: rotateY(0deg); }
              100% { transform: rotateY(720deg); }
            }

            .heartbeat {
              transform-origin: center;
              animation: beat 1.5s ease-in-out infinite;
            }

            @keyframes beat {
              0%   { transform: scale(1); }
              25%  { transform: scale(1.05); }
              50%  { transform: scale(1); }
            }
          `}
        </style>

        {/* Heart */}
        <path 
          className="heartbeat" 
          d="M256 420C256 420 120 340 120 240C120 180 170 140 220 160C256 180 292 160 328 160C378 160 420 200 420 240C420 340 256 420 256 420Z"
          fill="#3B82F6" 
        />

        {/* AI Cube with 3D illusion */}
        <g className="spin3d">
          <polygon points="206,190 306,190 286,210 186,210" fill="#1E40AF" />
          <polygon points="306,190 306,290 286,310 286,210" fill="#2563EB" />
          <polygon points="206,190 206,290 186,310 186,210" fill="#3B82F6" />
          <text x="246" y="250" textAnchor="middle" fontSize="28" fill="white" fontFamily="Arial, sans-serif">AI</text>
        </g>
      </svg>
      <h1 className="text-xl font-bold text-primary mt-2">Insperity Health AI</h1>
      <p className="text-sm text-muted-foreground italic">The Synaptic Pulse</p>
    </div>
  )
}