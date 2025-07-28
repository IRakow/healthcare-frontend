import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Pill, 
  Calendar, 
  FileText, 
  Heart,
  Camera,
  Apple,
  Activity,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/hooks/useUser';

interface TimelineEvent {
  id: string;
  type: 'appointment' | 'medication' | 'lab_result' | 'vital' | 'photo' | 'meal' | 'message' | 'alert';
  title: string;
  content: string;
  timestamp: string;
  metadata?: any;
  importance: 'low' | 'medium' | 'high';
}

const eventIcons = {
  appointment: Calendar,
  medication: Pill,
  lab_result: FileText,
  vital: Heart,
  photo: Camera,
  meal: Apple,
  message: MessageSquare,
  alert: AlertCircle
};

const eventColors = {
  appointment: 'text-blue-600 bg-blue-100',
  medication: 'text-purple-600 bg-purple-100',
  lab_result: 'text-green-600 bg-green-100',
  vital: 'text-red-600 bg-red-100',
  photo: 'text-orange-600 bg-orange-100',
  meal: 'text-yellow-600 bg-yellow-100',
  message: 'text-indigo-600 bg-indigo-100',
  alert: 'text-pink-600 bg-pink-100'
};

export const TimelineViewerEnhanced: React.FC = () => {
  const { userId } = useUser();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (userId) {
      loadEvents();
      
      // Subscribe to realtime updates
      const subscription = supabase
        .channel(`timeline:${userId}`)
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'patient_timeline',
            filter: `patient_id=eq.${userId}`
          }, 
          (payload) => {
            setEvents(prev => [payload.new as TimelineEvent, ...prev]);
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [userId]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('patient_timeline')
        .select('*')
        .eq('patient_id', userId)
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      // Also fetch recent activities from other tables
      const [appointments, labs, medications] = await Promise.all([
        supabase
          .from('appointments')
          .select('*')
          .eq('patient_id', userId)
          .gte('appointment_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .order('appointment_date', { ascending: false }),
        
        supabase
          .from('lab_results')
          .select('*')
          .eq('patient_id', userId)
          .order('result_date', { ascending: false })
          .limit(5),
        
        supabase
          .from('medication_logs')
          .select('*')
          .eq('patient_id', userId)
          .order('taken_at', { ascending: false })
          .limit(10)
      ]);

      // Combine and format all events
      const allEvents: TimelineEvent[] = [
        ...(data || []),
        ...(appointments.data || []).map(apt => ({
          id: `apt-${apt.id}`,
          type: 'appointment' as const,
          title: 'Appointment',
          content: `${apt.appointment_type} with ${apt.provider_name}`,
          timestamp: apt.appointment_date,
          importance: 'medium' as const
        })),
        ...(labs.data || []).map(lab => ({
          id: `lab-${lab.id}`,
          type: 'lab_result' as const,
          title: 'Lab Result',
          content: lab.test_name,
          timestamp: lab.result_date,
          importance: lab.is_abnormal ? 'high' : 'low' as const
        })),
        ...(medications.data || []).map(med => ({
          id: `med-${med.id}`,
          type: 'medication' as const,
          title: 'Medication Taken',
          content: `${med.medication_name} - ${med.dosage}`,
          timestamp: med.taken_at,
          importance: 'low' as const
        }))
      ];

      // Sort by timestamp
      allEvents.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      setEvents(allEvents);
    } catch (error) {
      console.error('Failed to load timeline events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = filter === 'all' 
    ? events 
    : events.filter(e => e.type === filter);

  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diff = now.getTime() - then.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return then.toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-gray-200 bg-white/70 backdrop-blur p-6 shadow space-y-4"
    >
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" /> Health Timeline
        </h3>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="text-sm border rounded-lg px-3 py-1"
        >
          <option value="all">All Events</option>
          <option value="appointment">Appointments</option>
          <option value="medication">Medications</option>
          <option value="lab_result">Lab Results</option>
          <option value="vital">Vitals</option>
          <option value="meal">Meals</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <Activity className="w-8 h-8 animate-pulse mx-auto text-gray-400" />
          <p className="text-sm text-muted-foreground mt-2">Loading timeline...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          No events to display. Your health activities will appear here.
        </p>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200" />
          
          {/* Events */}
          <ul className="space-y-4">
            {filteredEvents.map((event) => {
              const Icon = eventIcons[event.type] || Clock;
              const colorClass = eventColors[event.type] || 'text-gray-600 bg-gray-100';
              
              return (
                <motion.li
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-4"
                >
                  {/* Icon */}
                  <div className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center shrink-0 ${colorClass}`}>
                    <Icon className="w-6 h-6" />
                    {event.importance === 'high' && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 bg-white p-4 rounded-xl border shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-gray-800">{event.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{event.content}</p>
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {getRelativeTime(event.timestamp)}
                      </span>
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        </div>
      )}
    </motion.div>
  );
};