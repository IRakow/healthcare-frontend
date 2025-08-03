export default function AnimatedBrandLogo() {
  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="45" height="45" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
        <style>
          {`
            .heartbeat {
              transform-origin: center;
              animation: beat 1.5s ease-in-out infinite;
            }

            .spin {
              transform-origin: center;
              animation: spin 5s linear 1 forwards;
            }

            @keyframes beat {
              0%   { transform: scale(1); }
              25%  { transform: scale(1.05); }
              50%  { transform: scale(1); }
            }

            @keyframes spin {
              0%   { transform: rotate(0deg); }
              100% { transform: rotate(720deg); }
            }
          `}
        </style>

        {/* Heart */}
        <path 
          className="heartbeat" 
          d="M256 420C256 420 120 340 120 240C120 180 170 140 220 160C256 180 292 160 328 160C378 160 420 200 420 240C420 340 256 420 256 420Z"
          fill="#3B82F6" 
        />

        {/* AI Cube */}
        <g className="spin">
          <rect x="206" y="190" width="100" height="100" rx="12" fill="#1D4ED8" />
          <text x="256" y="250" textAnchor="middle" fontSize="32" fill="white" fontFamily="Arial, sans-serif">AI</text>
        </g>
      </svg>
      <h1 className="text-xl font-bold text-primary mt-2">Insperity Health AI</h1>
      <p className="text-sm text-muted-foreground italic">The Synaptic Pulse</p>
    </div>
  )
}