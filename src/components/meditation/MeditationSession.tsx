import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MeditationType } from '@/types/meditation';
import { Brain, Moon, Target, Heart, Wind } from 'lucide-react';
import Spinner from '@/components/ui/spinner';

export function MeditationSession() {
  const [selectedType, setSelectedType] = useState<MeditationType>('calm');
  const [logId, setLogId] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(false);

  const meditationIcons = {
    calm: Brain,
    sleep: Moon,
    focus: Target,
    anxiety: Heart,
    breathing: Wind,
  };

  async function startMeditation(type: MeditationType) {
    setLoading(true);
    setSelectedType(type);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: log } = await supabase.from('meditation_logs').insert({
        user_id: user.id,
        type,
        duration_minutes: type === 'sleep' ? 10 : 5
      }).select().single();

      if (log) {
        setLogId(log.id);
        setIsActive(true);
        
        // Create timeline event for starting
        await supabase.from('patient_timeline_events').insert({
          patient_id: user.id,
          type: 'update',
          label: `Started ${type} meditation`,
          data: { 
            meditation_log_id: log.id,
            meditation_type: type 
          }
        });
      }
    } catch (error) {
      console.error('Error starting meditation:', error);
      alert('Failed to start meditation session');
    } finally {
      setLoading(false);
    }
  }

  async function completeMeditation() {
    if (!logId) return;
    
    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update the log with completion time
      await supabase
        .from('meditation_logs')
        .update({ completed_at: new Date().toISOString() })
        .eq('id', logId);

      // Create completion timeline event
      await supabase.from('patient_timeline_events').insert({
        patient_id: user.id,
        type: 'update',
        label: `Completed ${selectedType} meditation`,
        data: { 
          meditation_log_id: logId,
          meditation_type: selectedType,
          duration_minutes: selectedType === 'sleep' ? 10 : 5
        }
      });

      alert('Meditation completed! Great job!');
      
      // Reset state
      setLogId(null);
      setIsActive(false);
    } catch (error) {
      console.error('Error completing meditation:', error);
      alert('Failed to complete meditation session');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {!isActive ? (
        <>
          <h2 className="text-2xl font-bold">Choose Your Meditation</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {(['calm', 'sleep', 'focus', 'anxiety', 'breathing'] as MeditationType[]).map((type) => {
              const Icon = meditationIcons[type] || Brain;
              const duration = type === 'sleep' ? 10 : 5;
              
              return (
                <Card key={type}>
                  <button
                    onClick={() => startMeditation(type)}
                    disabled={loading}
                    className="w-full p-6 text-center hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <Icon className="h-12 w-12 mx-auto mb-3 text-blue-500" />
                    <h3 className="font-semibold capitalize">{type}</h3>
                    <p className="text-sm text-gray-500 mt-1">{duration} minutes</p>
                  </button>
                </Card>
              );
            })}
          </div>
        </>
      ) : (
        <Card>
          <div className="p-8 text-center">
            {loading ? (
              <Spinner size="lg" />
            ) : (
              <>
                <div className="mb-6">
                  {(() => {
                    const Icon = meditationIcons[selectedType] || Brain;
                    return <Icon className="h-20 w-20 mx-auto text-blue-500 animate-pulse" />;
                  })()}
                </div>
                
                <h2 className="text-2xl font-bold mb-2 capitalize">{selectedType} Meditation</h2>
                <p className="text-gray-600 mb-6">
                  Duration: {selectedType === 'sleep' ? 10 : 5} minutes
                </p>
                
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    Session ID: {logId}
                  </p>
                </div>
                
                <Button onClick={completeMeditation} size="lg">
                  Complete Session
                </Button>
              </>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}