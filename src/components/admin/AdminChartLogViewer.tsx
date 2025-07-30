import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { FileSearch, Clock, User, FileText, Activity, Loader2, Calendar, ChevronDown, ChevronUp, Stethoscope, Heart, Pill, TestTube, CalendarCheck, AlertCircle, Download, Filter, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ChartLog {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_email: string;
  provider_id?: string;
  provider_name?: string;
  type: string;
  title: string;
  content: string;
  timestamp: string;
  importance?: 'low' | 'medium' | 'high';
  source: 'timeline' | 'soap_notes';
  metadata?: any;
  appointment_id?: string;
}

interface Filters {
  searchTerm: string;
  type: string;
  dateRange: string;
  source: string;
  providerId?: string;
}

export const AdminChartLogViewer: React.FC = () => {
  const [logs, setLogs] = useState<ChartLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    searchTerm: '',
    type: 'all',
    dateRange: 'week',
    source: 'all',
  });
  const [providers, setProviders] = useState<{ id: string; name: string }[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    soapNotes: 0,
    timelineEvents: 0,
    todayCount: 0
  });

  useEffect(() => {
    loadProviders();
    loadChartLogs();
    const interval = setInterval(loadChartLogs, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [filters]);

  const loadProviders = async () => {
    try {
      const { data, error } = await supabase
        .from('providers')
        .select(`
          id,
          user:auth.users(
            email,
            raw_user_meta_data
          )
        `);

      if (error) throw error;

      const formattedProviders = data?.map(p => ({
        id: p.id,
        name: p.user?.raw_user_meta_data?.full_name || p.user?.email || 'Unknown Provider'
      })) || [];

      setProviders(formattedProviders);
    } catch (error) {
      console.error('Failed to load providers:', error);
    }
  };

  const loadChartLogs = async () => {
    setLoading(true);
    try {
      let allLogs: ChartLog[] = [];

      // Apply date range filter
      let startDate = new Date();
      switch (filters.dateRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }

      // Load from patient_timeline
      if (filters.source === 'all' || filters.source === 'timeline') {
        let timelineQuery = supabase
          .from('patient_timeline')
          .select(`
            *,
            patient:patients(
              id,
              user_id
            )
          `)
          .gte('timestamp', startDate.toISOString())
          .order('timestamp', { ascending: false });

        if (filters.type !== 'all') {
          timelineQuery = timelineQuery.eq('type', filters.type);
        }

        if (filters.providerId) {
          timelineQuery = timelineQuery.eq('metadata->>provider_id', filters.providerId);
        }

        const { data: timelineData, error: timelineError } = await timelineQuery;

        if (timelineError) throw timelineError;

        const timelineLogs = await Promise.all((timelineData || []).map(async (event) => {
          // Get patient info
          let patientName = 'Unknown Patient';
          let patientEmail = '';
          if (event.patient?.user_id) {
            const { data: userData } = await supabase
              .from('auth.users')
              .select('email, raw_user_meta_data')
              .eq('id', event.patient.user_id)
              .single();
            
            patientName = userData?.raw_user_meta_data?.full_name || 'Unknown Patient';
            patientEmail = userData?.email || '';
          }

          // Get provider info if available
          let providerName = 'System';
          if (event.metadata?.provider_id) {
            const provider = providers.find(p => p.id === event.metadata.provider_id);
            providerName = provider?.name || 'Unknown Provider';
          }

          return {
            id: event.id,
            patient_id: event.patient_id,
            patient_name: patientName,
            patient_email: patientEmail,
            provider_id: event.metadata?.provider_id,
            provider_name: providerName,
            type: event.type,
            title: event.title,
            content: event.content,
            timestamp: event.timestamp,
            importance: event.importance,
            source: 'timeline' as const,
            metadata: event.metadata,
            appointment_id: event.metadata?.appointment_id
          };
        }));

        allLogs = [...allLogs, ...timelineLogs];
      }

      // Load from soap_notes
      if (filters.source === 'all' || filters.source === 'soap_notes') {
        let soapQuery = supabase
          .from('soap_notes')
          .select(`
            *,
            patient:patients(
              id,
              user_id
            ),
            provider:providers(
              id,
              user_id
            )
          `)
          .gte('created_at', startDate.toISOString())
          .order('created_at', { ascending: false });

        if (filters.providerId) {
          soapQuery = soapQuery.eq('provider_id', filters.providerId);
        }

        const { data: soapData, error: soapError } = await soapQuery;

        if (soapError) throw soapError;

        const soapLogs = await Promise.all((soapData || []).map(async (note) => {
          // Get patient info
          let patientName = 'Unknown Patient';
          let patientEmail = '';
          if (note.patient?.user_id) {
            const { data: userData } = await supabase
              .from('auth.users')
              .select('email, raw_user_meta_data')
              .eq('id', note.patient.user_id)
              .single();
            
            patientName = userData?.raw_user_meta_data?.full_name || 'Unknown Patient';
            patientEmail = userData?.email || '';
          }

          // Get provider info
          let providerName = 'Unknown Provider';
          if (note.provider?.user_id) {
            const { data: userData } = await supabase
              .from('auth.users')
              .select('email, raw_user_meta_data')
              .eq('id', note.provider.user_id)
              .single();
            
            providerName = userData?.raw_user_meta_data?.full_name || 'Unknown Provider';
          }

          return {
            id: note.id,
            patient_id: note.patient_id,
            patient_name: patientName,
            patient_email: patientEmail,
            provider_id: note.provider_id,
            provider_name: providerName,
            type: 'soap_note',
            title: 'SOAP Note',
            content: note.full_note || formatSOAP(note),
            timestamp: note.created_at,
            importance: 'high' as const,
            source: 'soap_notes' as const,
            metadata: {
              subjective: note.subjective,
              objective: note.objective,
              assessment: note.assessment,
              plan: note.plan
            },
            appointment_id: note.appointment_id
          };
        }));

        allLogs = [...allLogs, ...soapLogs];
      }

      // Sort by timestamp
      allLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      // Apply search filter
      if (filters.searchTerm) {
        const search = filters.searchTerm.toLowerCase();
        allLogs = allLogs.filter(log =>
          log.patient_name.toLowerCase().includes(search) ||
          log.patient_email.toLowerCase().includes(search) ||
          log.provider_name?.toLowerCase().includes(search) ||
          log.content.toLowerCase().includes(search) ||
          log.title.toLowerCase().includes(search)
        );
      }

      setLogs(allLogs);

      // Calculate stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      setStats({
        total: allLogs.length,
        soapNotes: allLogs.filter(l => l.source === 'soap_notes').length,
        timelineEvents: allLogs.filter(l => l.source === 'timeline').length,
        todayCount: allLogs.filter(l => new Date(l.timestamp) >= today).length
      });
    } catch (error) {
      console.error('Failed to load chart logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatSOAP = (note: any): string => {
    return `S: ${note.subjective || 'N/A'}\n\nO: ${note.objective || 'N/A'}\n\nA: ${note.assessment || 'N/A'}\n\nP: ${note.plan || 'N/A'}`;
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      'soap_note': <Stethoscope className="w-4 h-4" />,
      'vitals_recorded': <Heart className="w-4 h-4" />,
      'medication_prescribed': <Pill className="w-4 h-4" />,
      'lab_ordered': <TestTube className="w-4 h-4" />,
      'appointment_scheduled': <CalendarCheck className="w-4 h-4" />,
      'clinical_note': <FileText className="w-4 h-4" />,
      'telehealth': <Activity className="w-4 h-4" />
    };
    return icons[type] || <FileText className="w-4 h-4" />;
  };

  const getImportanceBadge = (importance?: string) => {
    switch (importance) {
      case 'high':
        return <Badge variant="destructive" className="text-xs">High</Badge>;
      case 'medium':
        return <Badge variant="default" className="text-xs">Medium</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">Low</Badge>;
    }
  };

  const exportLogs = () => {
    const csv = [
      ['Timestamp', 'Patient', 'Provider', 'Type', 'Title', 'Content'],
      ...logs.map(log => [
        new Date(log.timestamp).toLocaleString(),
        log.patient_name,
        log.provider_name || 'System',
        log.type,
        log.title,
        log.content.replace(/\n/g, ' ')
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chart-logs-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          <p className="ml-3 text-muted-foreground">Loading chart logs...</p>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur p-6 shadow space-y-6"
    >
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <FileSearch className="w-5 h-5 text-primary" /> Chart Log Viewer
        </h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => loadChartLogs()}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={exportLogs}
            disabled={logs.length === 0}
          >
            <Download className="w-4 h-4 mr-1" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          <p className="text-xs text-muted-foreground">Total Logs</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-primary">{stats.todayCount}</p>
          <p className="text-xs text-muted-foreground">Today</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-purple-600">{stats.soapNotes}</p>
          <p className="text-xs text-muted-foreground">SOAP Notes</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.timelineEvents}</p>
          <p className="text-xs text-muted-foreground">Timeline Events</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <FileSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search patient, provider, or content..."
            value={filters.searchTerm}
            onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
            className="pl-9"
          />
        </div>
        <Select
          value={filters.dateRange}
          onValueChange={(value) => setFilters({ ...filters, dateRange: value })}
        >
          <SelectTrigger className="w-[150px]">
            <Calendar className="w-4 h-4 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.source}
          onValueChange={(value) => setFilters({ ...filters, source: value })}
        >
          <SelectTrigger className="w-[150px]">
            <Filter className="w-4 h-4 mr-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            <SelectItem value="timeline">Timeline Only</SelectItem>
            <SelectItem value="soap_notes">SOAP Notes Only</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.type}
          onValueChange={(value) => setFilters({ ...filters, type: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="soap_note">SOAP Notes</SelectItem>
            <SelectItem value="clinical_note">Clinical Notes</SelectItem>
            <SelectItem value="vitals_recorded">Vitals</SelectItem>
            <SelectItem value="medication_prescribed">Medications</SelectItem>
            <SelectItem value="lab_ordered">Lab Orders</SelectItem>
            <SelectItem value="telehealth">Telehealth</SelectItem>
            <SelectItem value="appointment_scheduled">Appointments</SelectItem>
          </SelectContent>
        </Select>
        {providers.length > 0 && (
          <Select
            value={filters.providerId || 'all'}
            onValueChange={(value) => setFilters({ ...filters, providerId: value === 'all' ? undefined : value })}
          >
            <SelectTrigger className="w-[200px]">
              <User className="w-4 h-4 mr-1" />
              <SelectValue placeholder="All Providers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Providers</SelectItem>
              {providers.map(provider => (
                <SelectItem key={provider.id} value={provider.id}>
                  {provider.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Logs */}
      {logs.length === 0 ? (
        <Card className="p-8 text-center">
          <FileSearch className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-muted-foreground">No chart logs found matching your filters</p>
        </Card>
      ) : (
        <ul className="space-y-4">
          <AnimatePresence>
            {logs.map((log) => (
              <motion.li
                key={log.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white border rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div 
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getTypeIcon(log.type)}
                        <span className="font-medium text-gray-800">{log.title}</span>
                        {getImportanceBadge(log.importance)}
                        <Badge variant="outline" className="text-xs">
                          {log.source === 'soap_notes' ? 'SOAP' : 'Timeline'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          Patient: {log.patient_name}
                        </span>
                        <span className="flex items-center gap-1">
                          <Stethoscope className="w-3 h-3" />
                          Provider: {log.provider_name || 'System'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      {!expandedLog && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                          {log.content}
                        </p>
                      )}
                    </div>
                    <Button variant="ghost" size="icon">
                      {expandedLog === log.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedLog === log.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-gray-200 bg-gray-50"
                    >
                      <div className="p-4 space-y-3">
                        <div className="text-sm">
                          <p className="font-medium text-gray-700 mb-1">Full Content:</p>
                          <div className="whitespace-pre-wrap text-gray-600 bg-white p-3 rounded-lg border">
                            {log.content}
                          </div>
                        </div>
                        
                        {log.metadata && Object.keys(log.metadata).length > 0 && (
                          <div className="text-sm">
                            <p className="font-medium text-gray-700 mb-1">Additional Details:</p>
                            <div className="bg-white p-3 rounded-lg border space-y-1">
                              {log.appointment_id && (
                                <p className="text-xs">
                                  <span className="font-medium">Appointment ID:</span> {log.appointment_id}
                                </p>
                              )}
                              {log.patient_email && (
                                <p className="text-xs">
                                  <span className="font-medium">Patient Email:</span> {log.patient_email}
                                </p>
                              )}
                              {log.metadata.soap_note_id && (
                                <p className="text-xs">
                                  <span className="font-medium">SOAP Note ID:</span> {log.metadata.soap_note_id}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = `/admin/patients/${log.patient_id}`;
                            }}
                          >
                            View Patient
                          </Button>
                          {log.appointment_id && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.location.href = `/admin/appointments/${log.appointment_id}`;
                              }}
                            >
                              View Appointment
                            </Button>
                          )}
                          {log.source === 'soap_notes' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(log.content);
                                alert('SOAP note copied to clipboard!');
                              }}
                            >
                              Copy SOAP
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </motion.div>
  );
};