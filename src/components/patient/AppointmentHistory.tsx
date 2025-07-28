import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Video,
  FileText,
  Download,
  ChevronDown,
  ChevronUp,
  Filter,
  Search,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/hooks/useUser';
import { Input } from '@/components/ui/input';

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  provider_id: string;
  provider_name: string;
  provider_specialty: string;
  type: 'in-person' | 'telehealth' | 'phone';
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  location?: string;
  reason: string;
  notes?: string;
  duration_minutes: number;
  soap_note_id?: string;
  has_lab_orders?: boolean;
  has_prescriptions?: boolean;
  follow_up_scheduled?: boolean;
  created_at: string;
}

interface AppointmentFilters {
  status: string;
  type: string;
  provider: string;
  searchTerm: string;
  dateRange: 'all' | '30days' | '90days' | '6months' | '1year';
}

export const AppointmentHistory: React.FC = () => {
  const { userId } = useUser();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedAppointment, setExpandedAppointment] = useState<string | null>(null);
  const [filters, setFilters] = useState<AppointmentFilters>({
    status: 'all',
    type: 'all',
    provider: 'all',
    searchTerm: '',
    dateRange: '6months'
  });
  const [providers, setProviders] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (userId) {
      loadAppointments();
      loadProviders();
    }
  }, [userId, filters]);

  const loadProviders = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('provider_id, provider_name')
        .eq('patient_id', userId)
        .order('provider_name');

      if (error) throw error;

      // Extract unique providers
      const uniqueProviders = Array.from(
        new Map(data?.map(a => [a.provider_id, { id: a.provider_id, name: a.provider_name }]) || []).values()
      );

      setProviders(uniqueProviders);
    } catch (error) {
      console.error('Failed to load providers:', error);
    }
  };

  const loadAppointments = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('appointments')
        .select(`
          *,
          provider:providers(name, specialty),
          soap_note:soap_notes(id)
        `)
        .eq('patient_id', userId)
        .order('appointment_date', { ascending: false });

      // Apply filters
      if (filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      if (filters.type !== 'all') {
        query = query.eq('type', filters.type);
      }

      if (filters.provider !== 'all') {
        query = query.eq('provider_id', filters.provider);
      }

      // Apply date range filter
      if (filters.dateRange !== 'all') {
        const now = new Date();
        let startDate = new Date();
        
        switch (filters.dateRange) {
          case '30days':
            startDate.setDate(now.getDate() - 30);
            break;
          case '90days':
            startDate.setDate(now.getDate() - 90);
            break;
          case '6months':
            startDate.setMonth(now.getMonth() - 6);
            break;
          case '1year':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        }
        
        query = query.gte('appointment_date', startDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      let formattedAppointments = (data || []).map(apt => ({
        ...apt,
        provider_name: apt.provider?.name || 'Unknown Provider',
        provider_specialty: apt.provider?.specialty || 'General Practice'
      }));

      // Apply search filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        formattedAppointments = formattedAppointments.filter(apt =>
          apt.provider_name.toLowerCase().includes(searchLower) ||
          apt.reason.toLowerCase().includes(searchLower) ||
          (apt.notes?.toLowerCase().includes(searchLower))
        );
      }

      setAppointments(formattedAppointments);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'no-show':
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      default:
        return <Clock className="w-4 h-4 text-blue-600" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'telehealth':
        return <Video className="w-4 h-4" />;
      case 'phone':
        return <Phone className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  const formatDateTime = (date: string, time: string) => {
    const appointmentDate = new Date(date);
    const formattedDate = appointmentDate.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
    return `${formattedDate} at ${time}`;
  };

  const downloadSummary = async (appointmentId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-appointment-summary', {
        body: { appointmentId }
      });

      if (error) throw error;

      // Create download link
      const blob = new Blob([data.pdf], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `appointment-summary-${appointmentId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download summary:', error);
      alert('Failed to download appointment summary. Please try again.');
    }
  };

  const clearFilters = () => {
    setFilters({
      status: 'all',
      type: 'all',
      provider: 'all',
      searchTerm: '',
      dateRange: '6months'
    });
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur p-6 shadow space-y-6"
    >
      <div>
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Appointment History
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          View and manage your past and upcoming appointments
        </p>
      </div>

      {/* Filters */}
      <Card className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
          </h4>
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear All
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search appointments..."
              value={filters.searchTerm}
              onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
              className="pl-9"
            />
          </div>

          <select
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="no-show">No Show</option>
          </select>

          <select
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          >
            <option value="all">All Types</option>
            <option value="in-person">In-Person</option>
            <option value="telehealth">Telehealth</option>
            <option value="phone">Phone</option>
          </select>

          <select
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={filters.provider}
            onChange={(e) => setFilters({ ...filters, provider: e.target.value })}
          >
            <option value="all">All Providers</option>
            {providers.map(provider => (
              <option key={provider.id} value={provider.id}>
                {provider.name}
              </option>
            ))}
          </select>

          <select
            className="w-full border rounded-lg px-3 py-2 text-sm"
            value={filters.dateRange}
            onChange={(e) => setFilters({ ...filters, dateRange: e.target.value as AppointmentFilters['dateRange'] })}
          >
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
            <option value="all">All Time</option>
          </select>
        </div>
      </Card>

      {/* Appointments List */}
      {appointments.length === 0 ? (
        <Card className="p-8 text-center">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-muted-foreground">No appointments found</p>
          <p className="text-sm text-muted-foreground mt-1">
            Try adjusting your filters or booking a new appointment
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Showing {appointments.length} appointment{appointments.length !== 1 ? 's' : ''}
          </p>
          
          <AnimatePresence>
            {appointments.map((appointment) => (
              <motion.div
                key={appointment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="overflow-hidden">
                  <div
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedAppointment(
                      expandedAppointment === appointment.id ? null : appointment.id
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(appointment.status)}
                          <div>
                            <h4 className="font-medium text-gray-800">
                              {appointment.provider_name}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {appointment.provider_specialty}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDateTime(appointment.appointment_date, appointment.appointment_time)}
                          </span>
                          <span className="flex items-center gap-1">
                            {getTypeIcon(appointment.type)}
                            {appointment.type === 'in-person' ? appointment.location : appointment.type}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {appointment.duration_minutes} min
                          </span>
                        </div>

                        <p className="text-sm">
                          <span className="font-medium">Reason:</span> {appointment.reason}
                        </p>

                        <div className="flex items-center gap-2">
                          <Badge variant={
                            appointment.status === 'completed' ? 'default' :
                            appointment.status === 'scheduled' ? 'secondary' :
                            appointment.status === 'cancelled' ? 'destructive' :
                            'outline'
                          }>
                            {appointment.status}
                          </Badge>
                          {appointment.has_lab_orders && (
                            <Badge variant="outline" className="text-xs">
                              Lab Orders
                            </Badge>
                          )}
                          {appointment.has_prescriptions && (
                            <Badge variant="outline" className="text-xs">
                              Prescriptions
                            </Badge>
                          )}
                          {appointment.follow_up_scheduled && (
                            <Badge variant="outline" className="text-xs">
                              Follow-up Scheduled
                            </Badge>
                          )}
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-4"
                      >
                        {expandedAppointment === appointment.id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {expandedAppointment === appointment.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-gray-200"
                      >
                        <div className="p-4 space-y-4 bg-gray-50">
                          {appointment.notes && (
                            <div>
                              <h5 className="font-medium text-sm text-gray-700 mb-1">Notes</h5>
                              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                {appointment.notes}
                              </p>
                            </div>
                          )}

                          <div className="flex items-center gap-3">
                            {appointment.soap_note_id && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.location.href = `/patient/visit-summary/${appointment.soap_note_id}`}
                              >
                                <FileText className="w-4 h-4 mr-2" />
                                View Visit Summary
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => downloadSummary(appointment.id)}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download Summary
                            </Button>
                          </div>

                          <div className="text-xs text-muted-foreground">
                            Created on {new Date(appointment.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Stats Summary */}
      {appointments.length > 0 && (
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
          <h4 className="font-medium text-sm mb-3">Summary Statistics</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Total Appointments</p>
              <p className="font-medium text-lg">{appointments.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Completed</p>
              <p className="font-medium text-lg text-green-600">
                {appointments.filter(a => a.status === 'completed').length}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Upcoming</p>
              <p className="font-medium text-lg text-blue-600">
                {appointments.filter(a => a.status === 'scheduled').length}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Telehealth</p>
              <p className="font-medium text-lg text-purple-600">
                {appointments.filter(a => a.type === 'telehealth').length}
              </p>
            </div>
          </div>
        </Card>
      )}
    </motion.div>
  );
};