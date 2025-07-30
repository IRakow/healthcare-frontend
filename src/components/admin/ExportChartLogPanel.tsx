import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  FileText, 
  Calendar, 
  User, 
  Filter, 
  Loader2,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
  FilePlus,
  Archive,
  Clock,
  Users,
  Stethoscope,
  Heart,
  Pill,
  TestTube,
  Activity
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface ExportOptions {
  format: 'csv' | 'xlsx' | 'pdf' | 'json';
  dateRange: {
    from: Date;
    to: Date;
  };
  includeTypes: string[];
  includeProviders: string[];
  includePatients: string[];
  groupBy: 'none' | 'patient' | 'provider' | 'date' | 'type';
  includeSoapNotes: boolean;
  includeTimeline: boolean;
  includeMetadata: boolean;
  anonymize: boolean;
}

interface ExportStats {
  totalRecords: number;
  soapNotes: number;
  timelineEvents: number;
  patients: number;
  providers: number;
  dateRange: string;
}

interface Provider {
  id: string;
  name: string;
}

interface Patient {
  id: string;
  name: string;
  email: string;
}

export const ExportChartLogPanel: React.FC = () => {
  const [exporting, setExporting] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [exportStats, setExportStats] = useState<ExportStats | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
  const [patientSearch, setPatientSearch] = useState('');
  const [exportHistory, setExportHistory] = useState<any[]>([]);
  
  const [options, setOptions] = useState<ExportOptions>({
    format: 'xlsx',
    dateRange: {
      from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      to: new Date()
    },
    includeTypes: ['all'],
    includeProviders: ['all'],
    includePatients: ['all'],
    groupBy: 'none',
    includeSoapNotes: true,
    includeTimeline: true,
    includeMetadata: false,
    anonymize: false
  });

  const logTypes = [
    { value: 'soap_note', label: 'SOAP Notes', icon: <Stethoscope className="w-4 h-4" /> },
    { value: 'vitals_recorded', label: 'Vitals', icon: <Heart className="w-4 h-4" /> },
    { value: 'medication_prescribed', label: 'Medications', icon: <Pill className="w-4 h-4" /> },
    { value: 'lab_ordered', label: 'Lab Orders', icon: <TestTube className="w-4 h-4" /> },
    { value: 'telehealth', label: 'Telehealth', icon: <Activity className="w-4 h-4" /> },
    { value: 'clinical_note', label: 'Clinical Notes', icon: <FileText className="w-4 h-4" /> }
  ];

  useEffect(() => {
    loadProviders();
    loadPatients();
    loadExportHistory();
  }, []);

  useEffect(() => {
    if (options.dateRange.from && options.dateRange.to) {
      prepareExport();
    }
  }, [options]);

  const loadProviders = async () => {
    try {
      const { data, error } = await supabase
        .from('providers')
        .select('id, user_id');

      if (error) throw error;

      const providerData = await Promise.all((data || []).map(async (provider) => {
        const { data: userData } = await supabase
          .from('auth.users')
          .select('email, raw_user_meta_data')
          .eq('id', provider.user_id)
          .single();
        
        return {
          id: provider.id,
          name: userData?.raw_user_meta_data?.full_name || userData?.email || 'Unknown Provider'
        };
      }));

      setProviders(providerData);
    } catch (error) {
      console.error('Failed to load providers:', error);
    }
  };

  const loadPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, user_id');

      if (error) throw error;

      const patientData = await Promise.all((data || []).map(async (patient) => {
        const { data: userData } = await supabase
          .from('auth.users')
          .select('email, raw_user_meta_data')
          .eq('id', patient.user_id)
          .single();
        
        return {
          id: patient.id,
          name: userData?.raw_user_meta_data?.full_name || 'Unknown Patient',
          email: userData?.email || ''
        };
      }));

      setPatients(patientData.sort((a, b) => a.name.localeCompare(b.name)));
    } catch (error) {
      console.error('Failed to load patients:', error);
    }
  };

  const loadExportHistory = async () => {
    try {
      // Get export history from localStorage (in production, this would be from Supabase)
      const history = JSON.parse(localStorage.getItem('chartExportHistory') || '[]');
      setExportHistory(history.slice(0, 5)); // Last 5 exports
    } catch (error) {
      console.error('Failed to load export history:', error);
    }
  };

  const prepareExport = async () => {
    setPreparing(true);
    try {
      let totalRecords = 0;
      let soapCount = 0;
      let timelineCount = 0;
      const uniquePatients = new Set<string>();
      const uniqueProviders = new Set<string>();

      // Count SOAP notes
      if (options.includeSoapNotes) {
        let soapQuery = supabase
          .from('soap_notes')
          .select('id, patient_id, provider_id', { count: 'exact' })
          .gte('created_at', options.dateRange.from.toISOString())
          .lte('created_at', options.dateRange.to.toISOString());

        if (!options.includeProviders.includes('all')) {
          soapQuery = soapQuery.in('provider_id', options.includeProviders);
        }

        if (!options.includePatients.includes('all')) {
          soapQuery = soapQuery.in('patient_id', selectedPatients);
        }

        const { data: soapData, count } = await soapQuery;
        soapCount = count || 0;
        totalRecords += soapCount;

        soapData?.forEach(note => {
          uniquePatients.add(note.patient_id);
          uniqueProviders.add(note.provider_id);
        });
      }

      // Count timeline events
      if (options.includeTimeline) {
        let timelineQuery = supabase
          .from('patient_timeline')
          .select('id, patient_id, metadata', { count: 'exact' })
          .gte('timestamp', options.dateRange.from.toISOString())
          .lte('timestamp', options.dateRange.to.toISOString());

        if (!options.includeTypes.includes('all')) {
          timelineQuery = timelineQuery.in('type', options.includeTypes);
        }

        if (!options.includePatients.includes('all')) {
          timelineQuery = timelineQuery.in('patient_id', selectedPatients);
        }

        const { data: timelineData, count } = await timelineQuery;
        timelineCount = count || 0;
        totalRecords += timelineCount;

        timelineData?.forEach(event => {
          uniquePatients.add(event.patient_id);
          if (event.metadata?.provider_id) {
            uniqueProviders.add(event.metadata.provider_id);
          }
        });
      }

      setExportStats({
        totalRecords,
        soapNotes: soapCount,
        timelineEvents: timelineCount,
        patients: uniquePatients.size,
        providers: uniqueProviders.size,
        dateRange: `${format(options.dateRange.from, 'MMM d, yyyy')} - ${format(options.dateRange.to, 'MMM d, yyyy')}`
      });
    } catch (error) {
      console.error('Failed to prepare export:', error);
    } finally {
      setPreparing(false);
    }
  };

  const fetchExportData = async () => {
    const exportData: any[] = [];

    // Fetch SOAP notes
    if (options.includeSoapNotes) {
      let soapQuery = supabase
        .from('soap_notes')
        .select('*')
        .gte('created_at', options.dateRange.from.toISOString())
        .lte('created_at', options.dateRange.to.toISOString())
        .order('created_at', { ascending: false });

      if (!options.includeProviders.includes('all')) {
        soapQuery = soapQuery.in('provider_id', options.includeProviders);
      }

      if (!options.includePatients.includes('all')) {
        soapQuery = soapQuery.in('patient_id', selectedPatients);
      }

      const { data: soapData, error: soapError } = await soapQuery;

      if (soapError) throw soapError;

      for (const note of soapData || []) {
        const patient = patients.find(p => p.id === note.patient_id);
        const provider = providers.find(p => p.id === note.provider_id);

        exportData.push({
          id: note.id,
          timestamp: note.created_at,
          type: 'SOAP Note',
          patient_name: options.anonymize ? `Patient-${note.patient_id.slice(0, 8)}` : patient?.name || 'Unknown',
          patient_email: options.anonymize ? 'anonymized@example.com' : patient?.email || '',
          provider_name: provider?.name || 'Unknown',
          title: 'SOAP Note',
          content: note.full_note || `S: ${note.subjective}\nO: ${note.objective}\nA: ${note.assessment}\nP: ${note.plan}`,
          source: 'soap_notes',
          metadata: options.includeMetadata ? {
            appointment_id: note.appointment_id,
            subjective: note.subjective,
            objective: note.objective,
            assessment: note.assessment,
            plan: note.plan
          } : null
        });
      }
    }

    // Fetch timeline events
    if (options.includeTimeline) {
      let timelineQuery = supabase
        .from('patient_timeline')
        .select('*')
        .gte('timestamp', options.dateRange.from.toISOString())
        .lte('timestamp', options.dateRange.to.toISOString())
        .order('timestamp', { ascending: false });

      if (!options.includeTypes.includes('all')) {
        timelineQuery = timelineQuery.in('type', options.includeTypes);
      }

      if (!options.includePatients.includes('all')) {
        timelineQuery = timelineQuery.in('patient_id', selectedPatients);
      }

      const { data: timelineData, error: timelineError } = await timelineQuery;

      if (timelineError) throw timelineError;

      for (const event of timelineData || []) {
        const patient = patients.find(p => p.id === event.patient_id);
        const provider = event.metadata?.provider_id 
          ? providers.find(p => p.id === event.metadata.provider_id)
          : null;

        exportData.push({
          id: event.id,
          timestamp: event.timestamp,
          type: event.type,
          patient_name: options.anonymize ? `Patient-${event.patient_id.slice(0, 8)}` : patient?.name || 'Unknown',
          patient_email: options.anonymize ? 'anonymized@example.com' : patient?.email || '',
          provider_name: provider?.name || 'System',
          title: event.title,
          content: event.content,
          source: 'timeline',
          importance: event.importance,
          metadata: options.includeMetadata ? event.metadata : null
        });
      }
    }

    // Sort by timestamp
    exportData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Group data if needed
    if (options.groupBy !== 'none') {
      return groupData(exportData, options.groupBy);
    }

    return exportData;
  };

  const groupData = (data: any[], groupBy: string) => {
    const grouped: { [key: string]: any[] } = {};

    data.forEach(item => {
      let key = '';
      switch (groupBy) {
        case 'patient':
          key = item.patient_name;
          break;
        case 'provider':
          key = item.provider_name;
          break;
        case 'date':
          key = format(new Date(item.timestamp), 'yyyy-MM-dd');
          break;
        case 'type':
          key = item.type;
          break;
      }
      
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(item);
    });

    return grouped;
  };

  const exportToCSV = (data: any[]) => {
    const headers = [
      'Timestamp',
      'Patient',
      'Provider',
      'Type',
      'Title',
      'Content',
      'Source',
      'Importance'
    ];

    if (options.includeMetadata) {
      headers.push('Metadata');
    }

    const rows = data.map(item => {
      const row = [
        format(new Date(item.timestamp), 'yyyy-MM-dd HH:mm:ss'),
        item.patient_name,
        item.provider_name,
        item.type,
        item.title,
        item.content.replace(/\n/g, ' '),
        item.source,
        item.importance || ''
      ];

      if (options.includeMetadata) {
        row.push(JSON.stringify(item.metadata || {}));
      }

      return row;
    });

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chart-logs-export-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.csv`;
    link.click();
  };

  const exportToXLSX = (data: any[]) => {
    const ws_data = [
      [
        'Timestamp',
        'Patient',
        'Provider',
        'Type',
        'Title',
        'Content',
        'Source',
        'Importance'
      ]
    ];

    if (options.includeMetadata) {
      ws_data[0].push('Metadata');
    }

    data.forEach(item => {
      const row = [
        format(new Date(item.timestamp), 'yyyy-MM-dd HH:mm:ss'),
        item.patient_name,
        item.provider_name,
        item.type,
        item.title,
        item.content,
        item.source,
        item.importance || ''
      ];

      if (options.includeMetadata) {
        row.push(JSON.stringify(item.metadata || {}));
      }

      ws_data.push(row);
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 20 }, // Timestamp
      { wch: 25 }, // Patient
      { wch: 25 }, // Provider
      { wch: 20 }, // Type
      { wch: 30 }, // Title
      { wch: 50 }, // Content
      { wch: 15 }, // Source
      { wch: 10 }  // Importance
    ];

    if (options.includeMetadata) {
      ws['!cols'].push({ wch: 30 }); // Metadata
    }

    XLSX.utils.book_append_sheet(wb, ws, 'Chart Logs');

    // Add summary sheet
    const summary_data = [
      ['Export Summary'],
      [''],
      ['Date Range:', exportStats?.dateRange || ''],
      ['Total Records:', exportStats?.totalRecords || 0],
      ['SOAP Notes:', exportStats?.soapNotes || 0],
      ['Timeline Events:', exportStats?.timelineEvents || 0],
      ['Unique Patients:', exportStats?.patients || 0],
      ['Unique Providers:', exportStats?.providers || 0],
      [''],
      ['Export Date:', format(new Date(), 'yyyy-MM-dd HH:mm:ss')],
      ['Export Format:', 'XLSX'],
      ['Anonymized:', options.anonymize ? 'Yes' : 'No']
    ];

    const ws_summary = XLSX.utils.aoa_to_sheet(summary_data);
    XLSX.utils.book_append_sheet(wb, ws_summary, 'Summary');

    XLSX.writeFile(wb, `chart-logs-export-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.xlsx`);
  };

  const exportToPDF = (data: any[]) => {
    const doc = new jsPDF('l', 'mm', 'a4'); // Landscape orientation

    // Add title
    doc.setFontSize(18);
    doc.text('Chart Logs Export', 14, 15);
    
    // Add export info
    doc.setFontSize(10);
    doc.text(`Date Range: ${exportStats?.dateRange || ''}`, 14, 25);
    doc.text(`Total Records: ${exportStats?.totalRecords || 0}`, 14, 30);
    doc.text(`Export Date: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`, 14, 35);

    // Prepare table data
    const tableData = data.map(item => [
      format(new Date(item.timestamp), 'MM/dd/yy HH:mm'),
      item.patient_name.substring(0, 20) + (item.patient_name.length > 20 ? '...' : ''),
      item.provider_name.substring(0, 20) + (item.provider_name.length > 20 ? '...' : ''),
      item.type,
      item.title.substring(0, 30) + (item.title.length > 30 ? '...' : ''),
      item.content.substring(0, 50) + (item.content.length > 50 ? '...' : '')
    ]);

    // Add table
    doc.autoTable({
      head: [['Timestamp', 'Patient', 'Provider', 'Type', 'Title', 'Content']],
      body: tableData,
      startY: 45,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] }
    });

    doc.save(`chart-logs-export-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.pdf`);
  };

  const exportToJSON = (data: any[]) => {
    const exportObject = {
      exportInfo: {
        dateRange: exportStats?.dateRange,
        totalRecords: exportStats?.totalRecords,
        soapNotes: exportStats?.soapNotes,
        timelineEvents: exportStats?.timelineEvents,
        patients: exportStats?.patients,
        providers: exportStats?.providers,
        exportDate: new Date().toISOString(),
        anonymized: options.anonymize
      },
      data: options.groupBy !== 'none' ? data : { records: data }
    };

    const json = JSON.stringify(exportObject, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chart-logs-export-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.json`;
    link.click();
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const data = await fetchExportData();

      switch (options.format) {
        case 'csv':
          exportToCSV(options.groupBy !== 'none' ? Object.values(data).flat() : data);
          break;
        case 'xlsx':
          exportToXLSX(options.groupBy !== 'none' ? Object.values(data).flat() : data);
          break;
        case 'pdf':
          exportToPDF(options.groupBy !== 'none' ? Object.values(data).flat() : data);
          break;
        case 'json':
          exportToJSON(data);
          break;
      }

      // Save to export history
      const exportRecord = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        format: options.format,
        records: exportStats?.totalRecords || 0,
        dateRange: exportStats?.dateRange || '',
        user: 'Admin' // In production, get from auth
      };

      const history = JSON.parse(localStorage.getItem('chartExportHistory') || '[]');
      history.unshift(exportRecord);
      localStorage.setItem('chartExportHistory', JSON.stringify(history.slice(0, 10)));
      setExportHistory(history.slice(0, 5));

      // Show success notification
      alert('Export completed successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.email.toLowerCase().includes(patientSearch.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <Tabs defaultValue="configure" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="configure">Configure Export</TabsTrigger>
          <TabsTrigger value="preview">Preview & Export</TabsTrigger>
          <TabsTrigger value="history">Export History</TabsTrigger>
        </TabsList>

        <TabsContent value="configure" className="space-y-6">
          {/* Format Selection */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Export Format
            </h3>
            <RadioGroup
              value={options.format}
              onValueChange={(value) => setOptions({ ...options, format: value as any })}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="cursor-pointer flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4" />
                  CSV
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="xlsx" id="xlsx" />
                <Label htmlFor="xlsx" className="cursor-pointer flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-green-600" />
                  Excel (XLSX)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label htmlFor="pdf" className="cursor-pointer flex items-center gap-2">
                  <FileText className="w-4 h-4 text-red-600" />
                  PDF
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="json" id="json" />
                <Label htmlFor="json" className="cursor-pointer flex items-center gap-2">
                  <FilePlus className="w-4 h-4 text-blue-600" />
                  JSON
                </Label>
              </div>
            </RadioGroup>
          </Card>

          {/* Date Range */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Date Range
            </h3>
            <DatePickerWithRange
              date={options.dateRange}
              onDateChange={(range) => setOptions({ ...options, dateRange: range })}
            />
          </Card>

          {/* Data Sources */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Data Sources</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="soap"
                  checked={options.includeSoapNotes}
                  onCheckedChange={(checked) => 
                    setOptions({ ...options, includeSoapNotes: checked as boolean })
                  }
                />
                <Label htmlFor="soap" className="cursor-pointer">
                  Include SOAP Notes
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="timeline"
                  checked={options.includeTimeline}
                  onCheckedChange={(checked) => 
                    setOptions({ ...options, includeTimeline: checked as boolean })
                  }
                />
                <Label htmlFor="timeline" className="cursor-pointer">
                  Include Timeline Events
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="metadata"
                  checked={options.includeMetadata}
                  onCheckedChange={(checked) => 
                    setOptions({ ...options, includeMetadata: checked as boolean })
                  }
                />
                <Label htmlFor="metadata" className="cursor-pointer">
                  Include Metadata
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="anonymize"
                  checked={options.anonymize}
                  onCheckedChange={(checked) => 
                    setOptions({ ...options, anonymize: checked as boolean })
                  }
                />
                <Label htmlFor="anonymize" className="cursor-pointer text-orange-600">
                  Anonymize Patient Data
                </Label>
              </div>
            </div>
          </Card>

          {/* Log Types Filter */}
          {options.includeTimeline && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Event Types</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="all-types"
                    checked={options.includeTypes.includes('all')}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setOptions({ ...options, includeTypes: ['all'] });
                      } else {
                        setOptions({ ...options, includeTypes: [] });
                      }
                    }}
                  />
                  <Label htmlFor="all-types" className="cursor-pointer">
                    All Types
                  </Label>
                </div>
                {logTypes.map((type) => (
                  <div key={type.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={type.value}
                      checked={options.includeTypes.includes('all') || options.includeTypes.includes(type.value)}
                      disabled={options.includeTypes.includes('all')}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setOptions({
                            ...options,
                            includeTypes: [...options.includeTypes, type.value]
                          });
                        } else {
                          setOptions({
                            ...options,
                            includeTypes: options.includeTypes.filter(t => t !== type.value)
                          });
                        }
                      }}
                    />
                    <Label htmlFor={type.value} className="cursor-pointer flex items-center gap-2">
                      {type.icon}
                      {type.label}
                    </Label>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Provider Filter */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Provider Filter</h3>
            <Select
              value={options.includeProviders.includes('all') ? 'all' : 'selected'}
              onValueChange={(value) => {
                if (value === 'all') {
                  setOptions({ ...options, includeProviders: ['all'] });
                } else {
                  setOptions({ ...options, includeProviders: [] });
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Providers</SelectItem>
                <SelectItem value="selected">Selected Providers</SelectItem>
              </SelectContent>
            </Select>
            
            {!options.includeProviders.includes('all') && (
              <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
                {providers.map((provider) => (
                  <div key={provider.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`provider-${provider.id}`}
                      checked={options.includeProviders.includes(provider.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setOptions({
                            ...options,
                            includeProviders: [...options.includeProviders, provider.id]
                          });
                        } else {
                          setOptions({
                            ...options,
                            includeProviders: options.includeProviders.filter(p => p !== provider.id)
                          });
                        }
                      }}
                    />
                    <Label htmlFor={`provider-${provider.id}`} className="cursor-pointer">
                      {provider.name}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Patient Filter */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Patient Filter</h3>
            <Select
              value={options.includePatients.includes('all') ? 'all' : 'selected'}
              onValueChange={(value) => {
                if (value === 'all') {
                  setOptions({ ...options, includePatients: ['all'] });
                  setSelectedPatients([]);
                } else {
                  setOptions({ ...options, includePatients: [] });
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Patients</SelectItem>
                <SelectItem value="selected">Selected Patients</SelectItem>
              </SelectContent>
            </Select>
            
            {!options.includePatients.includes('all') && (
              <div className="mt-3 space-y-3">
                <Input
                  placeholder="Search patients..."
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  className="w-full"
                />
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {filteredPatients.map((patient) => (
                    <div key={patient.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`patient-${patient.id}`}
                        checked={selectedPatients.includes(patient.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedPatients([...selectedPatients, patient.id]);
                          } else {
                            setSelectedPatients(selectedPatients.filter(p => p !== patient.id));
                          }
                        }}
                      />
                      <Label htmlFor={`patient-${patient.id}`} className="cursor-pointer">
                        {patient.name} ({patient.email})
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Grouping Options */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Grouping</h3>
            <Select
              value={options.groupBy}
              onValueChange={(value) => setOptions({ ...options, groupBy: value as any })}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Grouping</SelectItem>
                <SelectItem value="patient">Group by Patient</SelectItem>
                <SelectItem value="provider">Group by Provider</SelectItem>
                <SelectItem value="date">Group by Date</SelectItem>
                <SelectItem value="type">Group by Type</SelectItem>
              </SelectContent>
            </Select>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          {/* Export Summary */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Archive className="w-5 h-5" />
              Export Summary
            </h3>
            
            {preparing ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400 mr-2" />
                <span className="text-muted-foreground">Preparing export statistics...</span>
              </div>
            ) : exportStats ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-primary">{exportStats.totalRecords}</p>
                  <p className="text-sm text-muted-foreground">Total Records</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{exportStats.soapNotes}</p>
                  <p className="text-sm text-muted-foreground">SOAP Notes</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{exportStats.timelineEvents}</p>
                  <p className="text-sm text-muted-foreground">Timeline Events</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{exportStats.patients}</p>
                  <p className="text-sm text-muted-foreground">Patients</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">{exportStats.providers}</p>
                  <p className="text-sm text-muted-foreground">Providers</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-lg font-medium">{exportStats.dateRange}</p>
                  <p className="text-sm text-muted-foreground">Date Range</p>
                </div>
              </div>
            ) : (
              <Alert>
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>
                  Configure your export options to see a preview of the data.
                </AlertDescription>
              </Alert>
            )}
          </Card>

          {/* Export Options Summary */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Export Configuration</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Format:</span>
                <Badge variant="outline">{options.format.toUpperCase()}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data Sources:</span>
                <div className="flex gap-2">
                  {options.includeSoapNotes && <Badge variant="secondary">SOAP Notes</Badge>}
                  {options.includeTimeline && <Badge variant="secondary">Timeline</Badge>}
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Grouping:</span>
                <span className="font-medium">{options.groupBy === 'none' ? 'None' : `By ${options.groupBy}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Anonymized:</span>
                <span className="font-medium">{options.anonymize ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Include Metadata:</span>
                <span className="font-medium">{options.includeMetadata ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </Card>

          {/* Export Actions */}
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Ready to Export</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {exportStats ? `Export ${exportStats.totalRecords} records in ${options.format.toUpperCase()} format` : 'Configure export options first'}
                </p>
              </div>
              <Button
                size="lg"
                onClick={handleExport}
                disabled={!exportStats || exportStats.totalRecords === 0 || exporting}
                className="min-w-[150px]"
              >
                {exporting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Export Now
                  </>
                )}
              </Button>
            </div>

            {exportStats && exportStats.totalRecords > 10000 && (
              <Alert className="mt-4">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>
                  Large export detected. This may take a few moments to process.
                </AlertDescription>
              </Alert>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Exports
            </h3>
            
            {exportHistory.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No export history available
              </p>
            ) : (
              <div className="space-y-3">
                {exportHistory.map((export_) => (
                  <div
                    key={export_.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-medium">
                        {export_.format.toUpperCase()} Export - {export_.records} records
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {export_.dateRange} • Exported {format(new Date(export_.timestamp), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                    <Badge variant="outline">{export_.user}</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};