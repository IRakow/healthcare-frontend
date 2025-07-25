import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { MeditationType } from '@/types/meditation';
import { Brain, Loader2 } from 'lucide-react';

interface QuickMeditationProps {
  type?: MeditationType;
  duration?: number;
  onComplete?: () => void;
}

export function QuickMeditation({ 
  type = 'calm', 
  duration = 5,
  onComplete 
}: QuickMeditationProps) {
  const [saving, setSaving] = useState(false);

  async function logQuickSession() {
    setSaving(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const startTime = new Date(Date.now() - duration * 60000);
      
      await supabase.from('meditation_logs').insert({
        user_id: user.id,
        type,
        duration_minutes: duration,
        started_at: startTime.toISOString(),
        completed_at: new Date().toISOString(),
      });

      // Create timeline event
      await supabase.from('patient_timeline_events').insert({
        patient_id: user.id,
        type: 'update',
        label: `Quick ${duration} minute meditation`,
        data: { 
          meditation_type: type,
          duration_minutes: duration 
        }
      });

      alert(`${duration} minute meditation logged!`);
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error logging meditation:', error);
      alert('Failed to log meditation');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Button 
      onClick={logQuickSession} 
      disabled={saving}
      variant="outline"
      size="sm"
    >
      {saving ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Saving...
        </>
      ) : (
        <>
          <Brain className="h-4 w-4 mr-2" />
          Log {duration}min Session
        </>
      )}
    </Button>
  );
}