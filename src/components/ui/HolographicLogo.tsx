// File: src/components/ui/HolographicLogo.tsx

import React from 'react';
import Lottie from 'lottie-react';
import pulseAnimation from '@/../public/lottie/holographicPulseFull_2xSpin.json';

export default function HolographicLogo() {
  return (
    <div className="fixed top-4 right-4 z-50 w-20 h-20 opacity-90 pointer-events-none animate-fade-in">
      <Lottie
        animationData={pulseAnimation}
        loop
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}