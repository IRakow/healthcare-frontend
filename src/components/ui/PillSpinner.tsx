export function PillSpinner({ size = 'default' }: { size?: 'small' | 'default' | 'large' }) {
  const sizeClasses = {
    small: 'w-8 h-8',
    default: 'w-10 h-10',
    large: 'w-16 h-16'
  };

  return (
    <div className="flex justify-center items-center">
      <div className={`${sizeClasses[size]} relative animate-spin`}>
        {/* Pill capsule shape */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full h-1/2 relative">
            {/* Left half - red */}
            <div className="absolute left-0 w-1/2 h-full bg-red-500 rounded-l-full"></div>
            {/* Right half - white */}
            <div className="absolute right-0 w-1/2 h-full bg-white rounded-r-full border border-gray-200"></div>
            {/* Center divider */}
            <div className="absolute left-1/2 top-0 w-0.5 h-full bg-gray-300 -translate-x-1/2"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Alternative medical-themed spinners
export function HeartbeatSpinner() {
  return (
    <div className="flex justify-center items-center">
      <div className="flex space-x-1">
        <div className="w-1 h-8 bg-red-500 animate-pulse-height delay-0"></div>
        <div className="w-1 h-12 bg-red-500 animate-pulse-height delay-100"></div>
        <div className="w-1 h-6 bg-red-500 animate-pulse-height delay-200"></div>
        <div className="w-1 h-10 bg-red-500 animate-pulse-height delay-300"></div>
        <div className="w-1 h-8 bg-red-500 animate-pulse-height delay-400"></div>
      </div>
    </div>
  );
}

export function CrossSpinner() {
  return (
    <div className="flex justify-center items-center">
      <div className="w-10 h-10 relative animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Medical cross */}
          <div className="relative">
            <div className="absolute w-8 h-2 bg-red-500 rounded -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"></div>
            <div className="absolute w-2 h-8 bg-red-500 rounded -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DNASpinner() {
  return (
    <div className="flex justify-center items-center">
      <div className="w-12 h-16 relative">
        <div className="absolute inset-0">
          <svg viewBox="0 0 50 80" className="w-full h-full animate-spin-slow">
            <path
              d="M15 10 Q25 20 35 10 T35 30 Q25 40 15 30 T15 50 Q25 60 35 50 T35 70"
              stroke="url(#gradient)"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M35 10 Q25 20 15 10 T15 30 Q25 40 35 30 T35 50 Q25 60 15 50 T15 70"
              stroke="url(#gradient)"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
}