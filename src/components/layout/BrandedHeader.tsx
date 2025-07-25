import { Link } from 'react-router-dom';
import { Logo } from '@/components/ui/Logo';
import { useEmployerBranding } from '@/hooks/useEmployerBranding';

interface BrandedHeaderProps {
  employerId?: string;
  fallbackName?: string;
}

export function BrandedHeader({ employerId, fallbackName = 'INSPERITY HEALTH' }: BrandedHeaderProps) {
  const { branding, loading } = useEmployerBranding(employerId);

  return (
    <header className="flex items-center justify-between p-4 border-b bg-white shadow-sm">
      <div className="flex items-center space-x-3">
        {/* Show employer logo if available, otherwise default logo */}
        {branding.logoUrl ? (
          <img 
            src={branding.logoUrl} 
            alt={fallbackName}
            className="h-10 max-w-[200px] object-contain"
          />
        ) : (
          <>
            <Logo animate />
            <h1 className="text-xl font-bold tracking-tight">
              {fallbackName} <span className="text-blue-500">AI</span>
            </h1>
          </>
        )}
        
        {/* Show tagline if available */}
        {branding.tagline && (
          <>
            <span className="text-gray-400 hidden md:inline">|</span>
            <span className="text-sm text-gray-600 hidden md:inline">{branding.tagline}</span>
          </>
        )}
      </div>
      
      <nav className="hidden sm:flex space-x-6 text-sm text-gray-700">
        <Link to="/patient">Dashboard</Link>
        <Link to="/calendar">Calendar</Link>
        <Link to="/settings">Settings</Link>
      </nav>
    </header>
  );
}

// Example usage with dynamic favicon
export function BrandedLayout({ children, employerId }: { children: React.ReactNode; employerId?: string }) {
  const { branding } = useEmployerBranding(employerId);

  return (
    <div className="min-h-screen bg-gray-50">
      <BrandedHeader employerId={employerId} />
      <main style={{ '--primary': branding.primaryColor } as any}>
        {children}
      </main>
    </div>
  );
}