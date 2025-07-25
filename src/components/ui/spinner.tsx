import { useEffect, useState } from 'react';

const ICONS = ['💊', '🅁🅇', '🧴'];

export default function Spinner({ size = 48 }: { size?: number }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % ICONS.length);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      role="status"
      aria-label="Loading"
      className="flex items-center justify-center"
      style={{ fontSize: `${size}px` }}
    >
      <span className="animate-pulse transition-all duration-300 ease-in-out">
        {ICONS[index]}
      </span>
    </div>
  );
}