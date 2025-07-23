import { ComponentType, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import supabase from '@/lib/supabase';

interface User {
  id: string;
  email: string;
  role: string;
}

interface WithAuthProps {
  [key: string]: any;
}

export function withAuth<P extends WithAuthProps>(
  Component: ComponentType<P>,
  allowedRoles: string[]
) {
  return function AuthWrapper(props: P) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const checkAuth = async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          
          if (!session) {
            setLoading(false);
            return;
          }

          // Fetch user profile with role
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('id, email, role')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            setUser({
              id: profile.id,
              email: profile.email,
              role: profile.role
            });
          }
        } catch (error) {
          console.error('Auth check failed:', error);
        } finally {
          setLoading(false);
        }
      };

      checkAuth();

      // Listen for auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
        } else if (session) {
          // Re-fetch user profile on auth change
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('id, email, role')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            setUser({
              id: profile.id,
              email: profile.email,
              role: profile.role
            });
          }
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }, []);

    // Show loading state
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-lg">Loading...</div>
        </div>
      );
    }

    // Redirect if not authenticated or not authorized
    if (!user || !allowedRoles.includes(user.role)) {
      return <Navigate to="/" replace />;
    }

    // Pass user as prop to wrapped component
    return <Component {...props} user={user} />;
  };
}