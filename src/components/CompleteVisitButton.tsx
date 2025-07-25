import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface CompleteVisitButtonProps {
  appointmentId: string;
  onComplete?: () => void;
}

export function CompleteVisitButton({ appointmentId, onComplete }: CompleteVisitButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleCompleteVisit() {
    setLoading(true);
    
    try {
      // Call edge function to complete visit and trigger SOAP generation
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/complete-visit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ appointmentId })
      });

      if (!response.ok) {
        throw new Error('Failed to complete visit');
      }

      // Add timeline event
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('patient_timeline_events').insert({
          patient_id: user.id,
          type: 'visit',
          label: 'Visit Completed',
          data: { appointment_id: appointmentId, completed_at: new Date() }
        });
      }

      alert('Visit completed successfully! SOAP note will be generated shortly.');
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error completing visit:', error);
      alert('Failed to complete visit. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button 
      onClick={handleCompleteVisit} 
      disabled={loading}
      size="lg"
      className="bg-green-600 hover:bg-green-700"
    >
      {loading ? (
        <>
          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          Completing...
        </>
      ) : (
        <>
          <CheckCircle className="h-5 w-5 mr-2" />
          Complete Visit
        </>
      )}
    </Button>
  );
}