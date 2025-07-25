import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

interface CompleteVisitButtonProps {
  appointmentId: string;
  patientId: string;
  onComplete?: () => void;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
}

export function CompleteVisitButton({ 
  appointmentId, 
  patientId, 
  onComplete,
  className,
  variant = 'default',
  size = 'default'
}: CompleteVisitButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    setLoading(true);
    
    try {
      // Update appointment status
      const { error: updateError } = await supabase
        .from('appointments')
        .update({ status: 'complete' })
        .eq('id', appointmentId);

      if (updateError) throw updateError;

      // Create timeline event
      const { error: timelineError } = await supabase
        .from('patient_timeline_events')
        .insert({
          patient_id: patientId,
          type: 'visit',
          label: 'Video Visit Completed',
          data: { appointment_id: appointmentId }
        });

      if (timelineError) throw timelineError;

      alert('Visit marked complete.');
      
      // Call onComplete callback if provided
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error completing visit:', error);
      alert('Failed to complete visit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleComplete}
      disabled={loading}
      variant={variant}
      size={size}
      className={className}
    >
      {loading ? (
        <>
          <Spinner size="sm" className="mr-2" />
          Completing...
        </>
      ) : (
        <>
          <CheckCircle className="h-4 w-4 mr-2" />
          Complete Visit
        </>
      )}
    </Button>
  );
}