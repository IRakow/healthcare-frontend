import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface PatientAccessGuardProps {
  patientId: string;
  children: React.ReactNode;
}

export default function PatientAccessGuard({ patientId, children }: PatientAccessGuardProps) {
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAccess();
  }, [patientId]);

  const checkAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAllowed(false);
        setLoading(false);
        return;
      }

      // Check if user is viewing their own data
      if (user.id === patientId) {
        setIsAllowed(true);
        setLoading(false);
        return;
      }

      // Check user role
      const { data: userData } = await supabase
        .from('users')
        .select('role, employer_id')
        .eq('id', user.id)
        .single();

      // Admins and providers can view all patients
      if (userData?.role === 'admin' || userData?.role === 'provider') {
        setIsAllowed(true);
        setLoading(false);
        return;
      }

      // Check if owner viewing their employee
      if (userData?.role === 'owner' && userData.employer_id) {
        const { data: patient } = await supabase
          .from('users')
          .select('employer_id')
          .eq('id', patientId)
          .single();

        setIsAllowed(patient?.employer_id === userData.employer_id);
      } else {
        setIsAllowed(false);
      }
    } catch (error) {
      console.error('Error checking access:', error);
      setIsAllowed(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  if (!isAllowed) {
    return (
      <div className="p-6 max-w-md mx-auto text-center">
        <div className="text-6xl mb-4">🚫</div>
        <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
        <p className="text-gray-600 mt-2">You don't have permission to view this patient's information.</p>
      </div>
    );
  }

  return <>{children}</>;
}

// Usage example:
/*
import PatientAccessGuard from '@/components/patient/PatientAccessGuard';
import PatientFile from '@/components/patient/PatientFile';

function PatientPage({ patientId }: { patientId: string }) {
  return (
    <PatientAccessGuard patientId={patientId}>
      <PatientFile patientId={patientId} />
    </PatientAccessGuard>
  );
}
*/