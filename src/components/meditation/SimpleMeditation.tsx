import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MeditationType } from '@/types/meditation';
import { Brain, Moon, Heart, Target, Wind } from 'lucide-react';

export function SimpleMeditation() {
  const [selectedType, setSelectedType] = useState<MeditationType>('calm');
  const [isCompleting, setIsCompleting] = useState(false);

  const meditationConfig = {
    calm: { icon: Brain, duration: 5, color: 'blue' },
    sleep: { icon: Moon, duration: 10, color: 'indigo' },
    anxiety: { icon: Heart, duration: 7, color: 'green' },
    focus: { icon: Target, duration: 5, color: 'purple' },
    breathing: { icon: Wind, duration: 3, color: 'cyan' },
  };

  async function completeMeditation(type: MeditationType) {
    setIsCompleting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const config = meditationConfig[type];
      const duration = config?.duration || 5;

      // Log to meditation_logs table
      await supabase.from('meditation_logs').insert({
        user_id: user.id,
        type,
        duration_minutes: duration,
        started_at: new Date(Date.now() - duration * 60000), // Backdate start time
        completed_at: new Date()
      });

      // Add to timeline
      await supabase.from('patient_timeline_events').insert({
        patient_id: user.id,
        type: 'update',
        label: `Meditation Session – ${type}`,
        data: { duration, completed_at: new Date() }
      });

      alert(`Great job! ${duration} minute ${type} meditation completed.`);
    } catch (error) {
      console.error('Error logging meditation:', error);
      alert('Failed to log meditation session');
    } finally {
      setIsCompleting(false);
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Quick Meditation Log</h3>
      
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(meditationConfig).map(([type, config]) => {
          const Icon = config.icon;
          const isSelected = selectedType === type;
          
          return (
            <Card key={type}>
              <button
                onClick={() => setSelectedType(type as MeditationType)}
                className={`w-full p-4 text-center transition-all ${
                  isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                }`}
              >
                <Icon className={`h-8 w-8 mx-auto mb-2 text-${config.color}-500`} />
                <p className="font-medium capitalize">{type}</p>
                <p className="text-xs text-gray-500">{config.duration} min</p>
              </button>
            </Card>
          );
        })}
      </div>

      <Button 
        onClick={() => completeMeditation(selectedType)}
        disabled={isCompleting}
        className="w-full"
      >
        {isCompleting ? 'Logging...' : `Complete ${selectedType} Meditation`}
      </Button>
    </div>
  );
}