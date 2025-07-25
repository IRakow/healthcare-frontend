import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MeditationType, MEDITATION_TYPES, MeditationLog } from '@/types/meditation';
import { Play, Pause, Check, BarChart3, Calendar } from 'lucide-react';
import { format, differenceInMinutes } from 'date-fns';

export function MeditationTracker() {
  const [selectedType, setSelectedType] = useState<MeditationType>('calm');
  const [isPlaying, setIsPlaying] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  const [recentLogs, setRecentLogs] = useState<MeditationLog[]>([]);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && startTime) {
      interval = setInterval(() => {
        const minutes = Math.floor(differenceInMinutes(new Date(), startTime));
        setElapsedMinutes(minutes);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, startTime]);

  async function loadStats() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get recent logs
      const { data: logs } = await supabase
        .from('meditation_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })
        .limit(10);

      if (logs) {
        setRecentLogs(logs);
        
        // Calculate total minutes this week
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekLogs = logs.filter(log => new Date(log.started_at) > weekAgo);
        const total = weekLogs.reduce((sum, log) => sum + (log.duration_minutes || 0), 0);
        setTotalMinutes(total);

        // Calculate streak (consecutive days)
        calculateStreak(logs);
      }
    } catch (error) {
      console.error('Error loading meditation stats:', error);
    }
  }

  function calculateStreak(logs: MeditationLog[]) {
    if (logs.length === 0) {
      setStreak(0);
      return;
    }

    const dates = logs.map(log => format(new Date(log.started_at), 'yyyy-MM-dd'));
    const uniqueDates = [...new Set(dates)].sort().reverse();
    
    let streakCount = 0;
    const today = format(new Date(), 'yyyy-MM-dd');
    const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd');
    
    if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
      streakCount = 1;
      
      for (let i = 1; i < uniqueDates.length; i++) {
        const prevDate = new Date(uniqueDates[i - 1]);
        const currDate = new Date(uniqueDates[i]);
        const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / 86400000);
        
        if (diffDays === 1) {
          streakCount++;
        } else {
          break;
        }
      }
    }
    
    setStreak(streakCount);
  }

  async function startMeditation() {
    setIsPlaying(true);
    setStartTime(new Date());
    setElapsedMinutes(0);
  }

  async function stopMeditation() {
    if (!startTime) return;

    const duration = Math.max(1, Math.floor(differenceInMinutes(new Date(), startTime)));
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from('meditation_logs').insert({
        user_id: user.id,
        type: selectedType,
        duration_minutes: duration,
        started_at: startTime.toISOString(),
        completed_at: new Date().toISOString(),
      });

      // Create timeline event
      await supabase.from('patient_timeline_events').insert({
        patient_id: user.id,
        type: 'update',
        label: `Completed ${duration} minute ${MEDITATION_TYPES[selectedType].title}`,
        data: { 
          meditation_type: selectedType,
          duration_minutes: duration 
        }
      });

      await loadStats();
    } catch (error) {
      console.error('Error saving meditation log:', error);
    }

    setIsPlaying(false);
    setStartTime(null);
    setElapsedMinutes(0);
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">This Week</p>
                <p className="text-2xl font-bold">{totalMinutes} min</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Streak</p>
                <p className="text-2xl font-bold">{streak} days</p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
          </div>
        </Card>
        
        <Card>
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Sessions</p>
                <p className="text-2xl font-bold">{recentLogs.length}</p>
              </div>
              <Check className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </Card>
      </div>

      {/* Meditation Types */}
      <Card>
        <div className="p-6">
          <h3 className="font-semibold mb-4">Choose Your Meditation</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.values(MEDITATION_TYPES).map((meditation) => (
              <button
                key={meditation.type}
                onClick={() => setSelectedType(meditation.type)}
                disabled={isPlaying}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedType === meditation.type
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${isPlaying ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="text-2xl mb-2">{meditation.icon}</div>
                <p className="text-sm font-medium">{meditation.title}</p>
                <p className="text-xs text-gray-500">{meditation.duration} min</p>
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Player */}
      <Card>
        <div className="p-6">
          <div className="text-center">
            <div className="text-4xl mb-4">{MEDITATION_TYPES[selectedType].icon}</div>
            <h2 className="text-2xl font-bold mb-2">{MEDITATION_TYPES[selectedType].title}</h2>
            <p className="text-gray-600 mb-6">{MEDITATION_TYPES[selectedType].description}</p>
            
            {isPlaying && (
              <div className="mb-6">
                <p className="text-3xl font-bold text-blue-600">{elapsedMinutes}:00</p>
                <p className="text-sm text-gray-500">minutes</p>
              </div>
            )}
            
            <div className="flex justify-center gap-4">
              {!isPlaying ? (
                <Button onClick={startMeditation} size="lg">
                  <Play className="h-5 w-5 mr-2" />
                  Start Meditation
                </Button>
              ) : (
                <Button onClick={stopMeditation} size="lg" variant="outline">
                  <Pause className="h-5 w-5 mr-2" />
                  Complete Session
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Recent Sessions */}
      {recentLogs.length > 0 && (
        <Card>
          <div className="p-6">
            <h3 className="font-semibold mb-4">Recent Sessions</h3>
            <div className="space-y-2">
              {recentLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{MEDITATION_TYPES[log.type as MeditationType]?.icon || '🧘'}</span>
                    <div>
                      <p className="font-medium">{MEDITATION_TYPES[log.type as MeditationType]?.title || log.type}</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(log.started_at), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-600">
                    {log.duration_minutes} min
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}