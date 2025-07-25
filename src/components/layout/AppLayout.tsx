import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Header } from './Header';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<'patient' | 'provider' | 'admin' | 'owner' | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
    
    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserRole(null);
        navigate('/');
      } else if (session?.user) {
        await checkUser();
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  async function checkUser() {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        // Get user details with role
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (userData) {
          setUser(userData);
          setUserRole(userData.role);
        }
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header role={userRole || undefined} userName={user?.full_name || user?.email} />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}

// Simple layout without auth checking (for public pages)
export function SimpleLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center space-x-3">
          <Logo animate />
          <h1 className="text-xl font-bold tracking-tight">
            INSPERITY HEALTH <span className="text-blue-500">AI</span>
          </h1>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}

// Import Logo component
import { Logo } from '@/components/ui/Logo';