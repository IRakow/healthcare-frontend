export function Progress({ value, className = '' }: { value: number; className?: string }) {
  return (
    <div className={`w-full h-2 bg-gray-200 rounded-full overflow-hidden ${className}`}>
      <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all" style={{ width: `${value}%` }}></div>
    </div>
  );
}