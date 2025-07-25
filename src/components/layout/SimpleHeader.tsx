import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface SimpleHeaderProps {
  showLogin?: boolean;
  showBackButton?: boolean;
  title?: string;
}

export function SimpleHeader({ showLogin = false, showBackButton = false, title }: SimpleHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between p-4 border-b bg-white">
      <div className="flex items-center space-x-3">
        <Logo animate />
        <h1 className="text-xl font-bold tracking-tight">
          INSPERITY HEALTH <span className="text-blue-500">AI</span>
        </h1>
        {title && (
          <>
            <span className="text-gray-400">|</span>
            <span className="text-gray-600">{title}</span>
          </>
        )}
      </div>
      <nav className="flex items-center gap-2">
        {showBackButton && (
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
        )}
        {showLogin && (
          <Button
            variant="outline"
            onClick={() => navigate('/patient/login')}
          >
            Patient Login
          </Button>
        )}
      </nav>
    </header>
  );
}