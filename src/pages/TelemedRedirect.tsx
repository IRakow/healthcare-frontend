import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import Spinner from '@/components/ui/spinner';

export default function TelemedRedirect() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/login');
          return;
        }

        // Check if user is a provider
        const { data: providerCheck } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();

        if (providerCheck?.role === 'provider' || providerCheck?.role === 'admin') {
          navigate(`/provider/telemed/${appointmentId}`);
        } else {
          navigate(`/patient/telemed/${appointmentId}`);
        }
      } catch (error) {
        console.error('Error redirecting to telemed:', error);
        navigate('/');
      }
    })();
  }, [appointmentId, navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600">Redirecting to video visit...</p>
      </div>
    </div>
  );
}