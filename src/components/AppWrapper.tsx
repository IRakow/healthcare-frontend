import { useEffect, useState } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { useUser } from '@/hooks/useUser';
import ProviderLayout from '@/components/layout/ProviderLayout';
import AdminLayout from '@/components/layout/AdminLayout';
import PatientLayout from '@/components/layout/PatientLayout';
import OwnerLayout from '@/components/layout/OwnerLayout';
import { CommandBar } from '@/components/ai/CommandBar';
import { Loader2 } from 'lucide-react';

type UserRole = 'admin' | 'provider' | 'patient' | 'owner' | null;

export const AppWrapper: React.FC = () => {
  const location = useLocation();
  const { role: userRole, loading: userLoading } = useUser();
  const [layoutRole, setLayoutRole] = useState<UserRole>(null);

  useEffect(() => {
    // Determine role based on route and user role
    const pathname = location.pathname;
    
    if (pathname.startsWith('/provider')) {
      setLayoutRole('provider');
    } else if (pathname.startsWith('/admin')) {
      setLayoutRole('admin');
    } else if (pathname.startsWith('/owner')) {
      setLayoutRole('owner');
    } else if (pathname.startsWith('/patient')) {
      setLayoutRole('patient');
    } else {
      // For root or other routes, use the user's actual role
      setLayoutRole(userRole as UserRole);
    }
  }, [location.pathname, userRole]);

  // Show loading state while determining user role
  if (userLoading || layoutRole === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Routes that should not have any layout
  const noLayoutRoutes = ['/login', '/signup', '/forgot-password', '/accept-invite'];
  if (noLayoutRoutes.some(route => location.pathname.startsWith(route))) {
    return <Outlet />;
  }

  // Apply the appropriate layout based on role
  switch (layoutRole) {
    case 'provider':
      return (
        <>
          <CommandBar />
          <ProviderLayout>
            <Outlet />
          </ProviderLayout>
        </>
      );
    case 'admin':
      return (
        <AdminLayout>
          <Outlet />
        </AdminLayout>
      );
    case 'owner':
      return (
        <>
          <CommandBar />
          <OwnerLayout>
            <Outlet />
          </OwnerLayout>
        </>
      );
    case 'patient':
      return (
        <>
          <CommandBar />
          <PatientLayout>
            <Outlet />
          </PatientLayout>
        </>
      );
    default:
      // Default layout or no layout
      return <Outlet />;
  }
};

// Higher-order component for pages that need specific layouts
export const withLayout = (Component: React.ComponentType, layout?: UserRole) => {
  return (props: any) => {
    const { role: userRole } = useUser();
    
    // If a specific layout is requested, use it
    const effectiveRole = layout || userRole;
    
    switch (effectiveRole) {
      case 'provider':
        return (
          <ProviderLayout>
            <Component {...props} />
          </ProviderLayout>
        );
      case 'admin':
        return (
          <AdminLayout>
            <Component {...props} />
          </AdminLayout>
        );
      case 'owner':
        return (
          <OwnerLayout>
            <Component {...props} />
          </OwnerLayout>
        );
      case 'patient':
        return (
          <PatientLayout>
            <Component {...props} />
          </PatientLayout>
        );
      default:
        return <Component {...props} />;
    }
  };
};