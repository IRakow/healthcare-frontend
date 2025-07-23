import { useEffect, useState } from 'react';
import supabase from '@/lib/supabase';

interface User {
  id: string;
  email: string;
  role: string;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setUser(null);
          setLoading(false);
          return;
        }

        // Fetch user profile with role
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('id, email, role')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          setError(profileError.message);
          setUser(null);
        } else if (profile) {
          setUser({
            id: profile.id,
            email: profile.email,
            role: profile.role
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setError(null);
      } else if (event === 'SIGNED_IN' && session) {
        // Re-fetch user profile on sign in
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
          setError(null);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      setError(error.message);
    }
  };

  return {
    user,
    loading,
    error,
    signOut,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isOwner: user?.role === 'owner',
    isPatient: user?.role === 'patient'
  };
}