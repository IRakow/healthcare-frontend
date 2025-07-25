import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, FileText, Brain, Heart, Flask, Stethoscope, Pill, Pin } from 'lucide-react';

interface TimelineEvent {
  id: string;
  patient_id: string;
  type: string;
  label: string;
  data: any;
  created_at: string;
}

const typeConfig = {
  update: { icon: FileText, color: 'blue', emoji: '📝' },
  upload: { icon: FileText, color: 'green', emoji: '📄' },
  ai: { icon: Brain, color: 'purple', emoji: '🧠' },
  vitals: { icon: Heart, color: 'red', emoji: '💓' },
  lab: { icon: Flask, color: 'orange', emoji: '🧪' },
  visit: { icon: Stethoscope, color: 'indigo', emoji: '🩺' },
  med: { icon: Pill, color: 'pink', emoji: '💊' }
} as const;

interface TimelineViewerProps {
  patientId: string;
  limit?: number;
  showDetails?: boolean;
}

export function TimelineViewer({ patientId, limit = 10, showDetails = true }: TimelineViewerProps) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadEvents();
  }, [patientId, limit]);

  async function loadEvents() {
    try {
      const query = supabase
        .from('patient_timeline_events')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });
      
      if (limit > 0) {
        query.limit(limit);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error loading timeline events:', error);
      } else {
        setEvents(data || []);
      }
    } catch (error) {
      console.error('Error loading timeline events:', error);
    } finally {
      setLoading(false);
    }
  }

  function toggleExpanded(eventId: string) {
    const newExpanded = new Set(expandedEvents);
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId);
    } else {
      newExpanded.add(eventId);
    }
    setExpandedEvents(newExpanded);
  }

  function formatData(data: any): string {
    if (!data) return 'No details available';
    
    // Special formatting for medical history updates
    if (data.conditions || data.surgeries || data.allergies || data.family_history) {
      const parts = [];
      if (data.conditions?.length) parts.push(`Conditions: ${data.conditions.join(', ')}`);
      if (data.surgeries?.length) parts.push(`Surgeries: ${data.surgeries.join(', ')}`);
      if (data.allergies?.length) parts.push(`Allergies: ${data.allergies.join(', ')}`);
      if (data.family_history?.length) parts.push(`Family History: ${data.family_history.join(', ')}`);
      return parts.join('\n');
    }
    
    // Special formatting for medication updates
    if (data.name && (data.dosage || data.frequency)) {
      const parts = [`Medication: ${data.name}`];
      if (data.strength) parts.push(`Strength: ${data.strength}`);
      if (data.dosage) parts.push(`Dosage: ${data.dosage}`);
      if (data.frequency) parts.push(`Frequency: ${data.frequency}`);
      return parts.join('\n');
    }
    
    // Default JSON formatting
    return JSON.stringify(data, null, 2);
  }

  function getRelativeTime(date: string): string {
    const now = new Date();
    const eventDate = new Date(date);
    const diffMs = now.getTime() - eventDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return eventDate.toLocaleDateString();
  }

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500">
        Loading timeline...
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <Card className="p-6 text-center">
        <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No timeline events yet</p>
        <p className="text-sm text-gray-400 mt-1">
          Events will appear here as you use the platform
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {events.map((event) => {
        const config = typeConfig[event.type as keyof typeof typeConfig] || { 
          icon: Pin, 
          color: 'gray', 
          emoji: '📌' 
        };
        const Icon = config.icon;
        const isExpanded = expandedEvents.has(event.id);
        
        return (
          <Card key={event.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg bg-${config.color}-50`}>
                <Icon className={`h-5 w-5 text-${config.color}-600`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium text-sm">{event.label}</h4>
                  <Badge variant="secondary" className="text-xs">
                    {event.type}
                  </Badge>
                </div>
                
                <p className="text-xs text-gray-500">
                  {getRelativeTime(event.created_at)} • {new Date(event.created_at).toLocaleTimeString()}
                </p>
                
                {showDetails && event.data && (
                  <div className="mt-2">
                    <button
                      onClick={() => toggleExpanded(event.id)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      {isExpanded ? 'Hide details' : 'Show details'}
                    </button>
                    
                    {isExpanded && (
                      <pre className="mt-2 text-xs bg-gray-50 p-3 rounded overflow-x-auto whitespace-pre-wrap">
                        {formatData(event.data)}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}