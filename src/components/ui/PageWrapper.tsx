import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageWrapperProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export function PageWrapper({ 
  children, 
  title,
  subtitle,
  icon,
  actions,
  className,
  maxWidth = 'xl'
}: PageWrapperProps) {
  const maxWidthClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    full: 'max-w-full'
  };

  return (
    <div className={cn(
      'p-6 mx-auto space-y-6',
      maxWidthClasses[maxWidth],
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          {icon && (
            <div className="text-blue-600">{icon}</div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            {subtitle && (
              <p className="mt-1 text-gray-600">{subtitle}</p>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

// Simplified version matching your example
export function SimplePageWrapper({ children, title }: { children: ReactNode; title: string }) {
  return (
    <div className="p-6 max-w-screen-xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-blue-700">{title}</h1>
      {children}
    </div>
  );
}

// Example usage:
/*
import { PageWrapper } from '@/components/ui/PageWrapper';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

function MyPage() {
  return (
    <PageWrapper 
      title="Appointments" 
      subtitle="Manage your upcoming appointments"
      icon={<Calendar className="h-8 w-8" />}
      actions={
        <Button>Book New</Button>
      }
    >
      <div>Your content here</div>
    </PageWrapper>
  );
}

// Or use the simple version:
function SimplePage() {
  return (
    <SimplePageWrapper title="Dashboard">
      <div>Your content here</div>
    </SimplePageWrapper>
  );
}
*/