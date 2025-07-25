import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function usePatientAccess(patientId: string) {
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientId) {
      setIsAllowed(false);
      setLoading(false);
      return;
    }

    checkAccess();
  }, [patientId]);

  const checkAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAllowed(false);
        return;
      }

      // User viewing their own data
      if (user.id === patientId) {
        setIsAllowed(true);
        return;
      }

      // Get user details
      const { data: userData } = await supabase
        .from('users')
        .select('role, employer_id')
        .eq('id', user.id)
        .single();

      // Check role-based access
      switch (userData?.role) {
        case 'admin':
        case 'provider':
          setIsAllowed(true);
          break;
        
        case 'owner':
          // Owner can view employees in their organization
          if (userData.employer_id) {
            const { data: patient } = await supabase
              .from('users')
              .select('employer_id')
              .eq('id', patientId)
              .single();
            
            setIsAllowed(patient?.employer_id === userData.employer_id);
          } else {
            setIsAllowed(false);
          }
          break;
        
        default:
          setIsAllowed(false);
      }
    } catch (error) {
      console.error('Error checking patient access:', error);
      setIsAllowed(false);
    } finally {
      setLoading(false);
    }
  };

  return { isAllowed, loading };
}

// Helper function for simple access checks
export async function userIsAllowedToView(patientId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // Self access
    if (user.id === patientId) return true;

    const { data: userData } = await supabase
      .from('users')
      .select('role, employer_id')
      .eq('id', user.id)
      .single();

    // Admin/provider access
    if (userData?.role === 'admin' || userData?.role === 'provider') return true;

    // Owner access to employees
    if (userData?.role === 'owner' && userData.employer_id) {
      const { data: patient } = await supabase
        .from('users')
        .select('employer_id')
        .eq('id', patientId)
        .single();
      
      return patient?.employer_id === userData.employer_id;
    }

    return false;
  } catch (error) {
    console.error('Access check error:', error);
    return false;
  }
}