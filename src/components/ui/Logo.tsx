import { useEffect, useState } from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
  className?: string;
}

export function Logo({ size = 'md', animate = false, className = '' }: LogoProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (animate) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [animate]);

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-16 w-16'
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <svg
        viewBox="0 0 100 100"
        className={`w-full h-full ${isAnimating ? 'animate-pulse' : ''}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Healthcare Cross Background */}
        <rect
          x="35"
          y="10"
          width="30"
          height="80"
          rx="4"
          fill="#3B82F6"
          className={isAnimating ? 'animate-pulse' : ''}
        />
        <rect
          x="10"
          y="35"
          width="80"
          height="30"
          rx="4"
          fill="#3B82F6"
          className={isAnimating ? 'animate-pulse' : ''}
        />
        
        {/* AI Dot Pattern */}
        <circle cx="50" cy="30" r="3" fill="white" opacity="0.9" />
        <circle cx="50" cy="50" r="4" fill="white" />
        <circle cx="50" cy="70" r="3" fill="white" opacity="0.9" />
        
        <circle cx="30" cy="50" r="3" fill="white" opacity="0.9" />
        <circle cx="70" cy="50" r="3" fill="white" opacity="0.9" />
        
        {/* Animated Pulse Ring */}
        {animate && (
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#60A5FA"
            strokeWidth="2"
            opacity="0"
            className="animate-ping"
          />
        )}
      </svg>
    </div>
  );
}

// Alternative Modern Logo Design
export function LogoModern({ size = 'md', animate = false, className = '' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-16 w-16'
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Gradient Definition */}
        <defs>
          <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
        </defs>
        
        {/* Heart/Health Symbol */}
        <path
          d="M50 85 C20 60, 5 40, 15 25 C25 10, 40 15, 50 25 C60 15, 75 10, 85 25 C95 40, 80 60, 50 85Z"
          fill="url(#blueGradient)"
          className={animate ? 'animate-pulse' : ''}
        />
        
        {/* AI Circuit Pattern */}
        <g stroke="white" strokeWidth="1.5" fill="none">
          <path d="M35 35 L45 35 L50 40 L55 35 L65 35" />
          <path d="M35 50 L45 50 L50 45 L55 50 L65 50" />
          <path d="M35 65 L45 65 L50 60 L55 65 L65 65" />
        </g>
        
        {/* Central AI Node */}
        <circle cx="50" cy="50" r="5" fill="white" />
      </svg>
    </div>
  );
}