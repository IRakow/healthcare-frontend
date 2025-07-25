import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from '@/components/ui/Logo';
import { AppHeader, SimpleAppHeader } from './AppHeader';

interface LayoutProps {
  children: ReactNode;
  role?: 'patient' | 'provider' | 'admin' | 'owner';
  useSimpleHeader?: boolean;
}

export function Layout({ children, role = 'patient', useSimpleHeader = false }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {useSimpleHeader ? (
        <SimpleAppHeader />
      ) : (
        <AppHeader role={role} />
      )}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}

// Minimal layout with just the header you specified
export function MinimalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between p-4 border-b bg-white shadow-sm">
        <Logo animate />
        <nav className="hidden sm:flex space-x-6 text-sm text-gray-700">
          <Link to="/patient">Dashboard</Link>
          <Link to="/calendar">Calendar</Link>
          <Link to="/settings">Settings</Link>
        </nav>
      </header>
      <main>
        {children}
      </main>
    </div>
  );
}