import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { CommandBar } from '@/components/CommandBar';

export function AppLayout() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Outlet />
      {user && <CommandBar role={user?.user_metadata?.role || 'patient'} />}
    </div>
  );
}