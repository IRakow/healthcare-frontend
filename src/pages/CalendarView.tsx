import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, DollarSign, FileText, Calendar as CalendarIcon } from 'lucide-react';
import { useBranding } from '@/hooks/useBranding';

interface CalendarEvent {
  date: string;
  label: string;
  type: 'appointment' | 'invoice' | 'payout';
  time?: string;
  amount?: number;
  metadata?: any;
}

export default function CalendarView() {
  const [value, setValue] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [filtered, setFiltered] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const branding = useBranding();
  const accentColor = branding?.primary_color || '#3B82F6';

  useEffect(() => {
    loadUserAndEvents();
  }, []);

  async function loadUserAndEvents() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      setUser(user);
      const role = user.user_metadata?.role || 'patient';
      let allEvents: CalendarEvent[] = [];

      if (role === 'provider') {
        const { data } = await supabase
          .from('appointments')
          .select(`
            *,
            patient:users!appointments_patient_id_fkey(full_name)
          `)
          .eq('provider_id', user.id);
        
        allEvents = data?.map((a) => ({
          date: a.date,
          label: `${a.patient?.full_name || 'Patient'} - ${a.reason}`,
          type: 'appointment' as const,
          time: a.time,
          metadata: a
        })) || [];
      }

      if (role === 'patient') {
        const { data } = await supabase
          .from('appointments')
          .select(`
            *,
            provider:users!appointments_provider_id_fkey(full_name)
          `)
          .eq('patient_id', user.id);
        
        allEvents = data?.map((a) => ({
          date: a.date,
          label: `Dr. ${a.provider?.full_name || 'Provider'} - ${a.reason}`,
          type: 'appointment' as const,
          time: a.time,
          metadata: a
        })) || [];
      }

      if (role === 'admin' || role === 'owner') {
        const { data: invoices } = await supabase
          .from('invoices')
          .select(`
            *,
            employer:employers(name)
          `);
        
        // Invoice events
        const invoiceEvents = invoices?.map((inv) => ({
          date: inv.month + '-01',
          label: `Invoice: ${inv.employer?.name || inv.employer_id}`,
          type: 'invoice' as const,
          amount: inv.total_amount,
          metadata: inv
        })) || [];

        // Payout events (25th of each month)
        const payoutEvents = invoices?.map((inv) => ({
          date: inv.month + '-25',
          label: `Payout: ${inv.employer?.name || inv.employer_id}`,
          type: 'payout' as const,
          amount: inv.total_amount,
          metadata: inv
        })) || [];

        allEvents = [...invoiceEvents, ...payoutEvents];
      }

      setEvents(allEvents);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const selectedDate = format(value, 'yyyy-MM-dd');
    const matching = events.filter(e => e.date === selectedDate);
    setFiltered(matching);
  }, [value, events]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <Clock className="h-4 w-4" />;
      case 'invoice':
        return <FileText className="h-4 w-4" />;
      case 'payout':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <CalendarIcon className="h-4 w-4" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'appointment':
        return 'default';
      case 'invoice':
        return 'secondary';
      case 'payout':
        return 'outline';
      default:
        return 'default';
    }
  };

  // Mark dates with events
  const tileContent = ({ date }: { date: Date }) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const hasEvents = events.some(e => e.date === dateStr);
    
    if (hasEvents) {
      return (
        <div className="flex justify-center">
          <div 
            className="w-1.5 h-1.5 rounded-full mt-1" 
            style={{ backgroundColor: accentColor }}
          />
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-12 text-gray-500">
          Loading calendar...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Calendar</h1>
        <p className="text-sm text-gray-500">
          {user?.user_metadata?.role || 'patient'} view
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div style={{ borderColor: accentColor }} className="rounded-lg border p-4 bg-white">
          <Calendar 
            onChange={(date) => setValue(date as Date)} 
            value={value}
            tileContent={tileContent}
            className="rounded-lg border-0"
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            Events for {format(value, 'MMMM d, yyyy')}
          </h2>
          
          {filtered.length === 0 ? (
            <div style={{ borderColor: accentColor }} className="rounded-lg border p-6 text-center">
              <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No events scheduled for this day</p>
            </div>
          ) : (
            filtered.map((event, i) => (
              <div key={i} style={{ borderColor: accentColor }} className="rounded-lg border p-4">
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <div className="p-2 bg-gray-50 rounded-lg">
                      {getEventIcon(event.type)}
                    </div>
                    <div>
                      <h3 className="font-medium">{event.label}</h3>
                      {event.time && (
                        <p className="text-sm text-gray-600 mt-1">
                          Time: {event.time}
                        </p>
                      )}
                      {event.amount && (
                        <p className="text-sm text-gray-600 mt-1">
                          Amount: ${event.amount.toFixed(2)}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge variant={getEventColor(event.type)}>
                    {event.type}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}