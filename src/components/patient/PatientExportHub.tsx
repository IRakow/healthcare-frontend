import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  FileText, 
  FileDown, 
  Calendar,
  Pill,
  Heart,
  FileImage,
  Activity,
  Download,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/hooks/useUser';
import { jsPDF } from 'jspdf';

interface ExportOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  dataTypes: string[];
}

const exportOptions: ExportOption[] = [
  {
    id: 'full-summary',
    title: 'Complete Health Summary',
    description: 'All health data including vitals, medications, labs, and appointments',
    icon: <FileText className="w-5 h-5" />,
    dataTypes: ['profile', 'vitals', 'medications', 'appointments', 'labs', 'timeline']
  },
  {
    id: 'medication-list',
    title: 'Medication List',
    description: 'Current medications with dosages and schedules',
    icon: <Pill className="w-5 h-5" />,
    dataTypes: ['medications']
  },
  {
    id: 'lab-history',
    title: 'Lab Results History',
    description: 'All lab results with trends and abnormal values',
    icon: <FileImage className="w-5 h-5" />,
    dataTypes: ['labs']
  },
  {
    id: 'visit-summaries',
    title: 'Visit Summaries',
    description: 'Recent appointment notes and care plans',
    icon: <Calendar className="w-5 h-5" />,
    dataTypes: ['appointments', 'soap_notes']
  },
  {
    id: 'vitals-trends',
    title: 'Vitals & Trends',
    description: 'Blood pressure, weight, and other vital trends',
    icon: <Heart className="w-5 h-5" />,
    dataTypes: ['vitals']
  },
  {
    id: 'activity-log',
    title: 'Activity Timeline',
    description: 'Complete timeline of health activities',
    icon: <Activity className="w-5 h-5" />,
    dataTypes: ['timeline']
  }
];

export const PatientExportHub: React.FC = () => {
  const { userId, name } = useUser();
  const [exporting, setExporting] = useState<string | null>(null);
  const [exported, setExported] = useState<string[]>([]);

  const fetchData = async (dataTypes: string[]) => {
    const data: any = {};

    // Fetch user profile
    if (dataTypes.includes('profile')) {
      const { data: profile } = await supabase
        .from('patient_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      data.profile = profile;
    }

    // Fetch vitals
    if (dataTypes.includes('vitals')) {
      const { data: vitals } = await supabase
        .from('vitals')
        .select('*')
        .eq('patient_id', userId)
        .order('recorded_at', { ascending: false })
        .limit(100);
      data.vitals = vitals || [];
    }

    // Fetch medications
    if (dataTypes.includes('medications')) {
      const { data: medications } = await supabase
        .from('medications')
        .select('*')
        .eq('patient_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      data.medications = medications || [];
    }

    // Fetch appointments
    if (dataTypes.includes('appointments')) {
      const { data: appointments } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', userId)
        .order('appointment_date', { ascending: false })
        .limit(50);
      data.appointments = appointments || [];
    }

    // Fetch labs
    if (dataTypes.includes('labs')) {
      const { data: labs } = await supabase
        .from('lab_results')
        .select('*')
        .eq('patient_id', userId)
        .order('test_date', { ascending: false });
      data.labs = labs || [];
    }

    // Fetch timeline
    if (dataTypes.includes('timeline')) {
      const { data: timeline } = await supabase
        .from('patient_timeline')
        .select('*')
        .eq('patient_id', userId)
        .order('timestamp', { ascending: false })
        .limit(200);
      data.timeline = timeline || [];
    }

    // Fetch SOAP notes
    if (dataTypes.includes('soap_notes')) {
      const { data: soapNotes } = await supabase
        .from('soap_notes')
        .select('*')
        .eq('patient_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);
      data.soapNotes = soapNotes || [];
    }

    return data;
  };

  const generatePDF = (title: string, data: any) => {
    const doc = new jsPDF();
    let yPosition = 20;

    // Header
    doc.setFontSize(20);
    doc.text(title, 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(12);
    doc.text(`Generated for: ${name}`, 20, yPosition);
    yPosition += 5;
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, yPosition);
    yPosition += 15;

    // Content based on data type
    doc.setFontSize(10);

    // Profile section
    if (data.profile) {
      doc.setFontSize(14);
      doc.text('Patient Information', 20, yPosition);
      yPosition += 10;
      doc.setFontSize(10);
      doc.text(`Date of Birth: ${data.profile.date_of_birth || 'N/A'}`, 20, yPosition);
      yPosition += 5;
      doc.text(`Blood Type: ${data.profile.blood_type || 'N/A'}`, 20, yPosition);
      yPosition += 5;
      doc.text(`Allergies: ${data.profile.allergies?.join(', ') || 'None reported'}`, 20, yPosition);
      yPosition += 15;
    }

    // Medications section
    if (data.medications && data.medications.length > 0) {
      doc.setFontSize(14);
      doc.text('Current Medications', 20, yPosition);
      yPosition += 10;
      doc.setFontSize(10);
      
      data.medications.forEach((med: any) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(`• ${med.name} - ${med.dosage} - ${med.frequency}`, 25, yPosition);
        yPosition += 5;
        if (med.instructions) {
          doc.text(`  Instructions: ${med.instructions}`, 30, yPosition);
          yPosition += 5;
        }
        yPosition += 2;
      });
      yPosition += 10;
    }

    // Vitals section
    if (data.vitals && data.vitals.length > 0) {
      doc.setFontSize(14);
      doc.text('Recent Vitals', 20, yPosition);
      yPosition += 10;
      doc.setFontSize(10);
      
      data.vitals.slice(0, 10).forEach((vital: any) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        const date = new Date(vital.recorded_at).toLocaleDateString();
        doc.text(`${date}: BP ${vital.blood_pressure_systolic}/${vital.blood_pressure_diastolic}, ` +
                `HR ${vital.heart_rate}, Weight ${vital.weight} lbs`, 25, yPosition);
        yPosition += 6;
      });
      yPosition += 10;
    }

    // Lab results section
    if (data.labs && data.labs.length > 0) {
      doc.setFontSize(14);
      doc.text('Lab Results', 20, yPosition);
      yPosition += 10;
      doc.setFontSize(10);
      
      data.labs.forEach((lab: any) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        const date = new Date(lab.test_date).toLocaleDateString();
        doc.text(`${date}: ${lab.file_name} - ${lab.lab_name || 'Unknown Lab'}`, 25, yPosition);
        if (lab.is_abnormal) {
          doc.text('  ⚠️ Abnormal values detected', 30, yPosition + 5);
          yPosition += 5;
        }
        yPosition += 7;
      });
    }

    return doc;
  };

  const handleExport = async (option: ExportOption) => {
    setExporting(option.id);
    
    try {
      // Fetch all required data
      const data = await fetchData(option.dataTypes);
      
      // Generate PDF
      const pdf = generatePDF(option.title, data);
      
      // Download PDF
      pdf.save(`${option.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
      
      // Mark as exported
      setExported(prev => [...prev, option.id]);
      
      // Log export activity
      await supabase.from('patient_timeline').insert({
        patient_id: userId,
        type: 'export',
        title: 'Data Exported',
        content: `Exported ${option.title}`,
        timestamp: new Date().toISOString(),
        importance: 'low'
      });
      
      // Reset after delay
      setTimeout(() => {
        setExported(prev => prev.filter(id => id !== option.id));
      }, 3000);
    } catch (error) {
      console.error('Failed to export data:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setExporting(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur p-6 shadow space-y-6"
    >
      <div>
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" /> Export My Health Data
        </h3>
        <p className="text-sm text-muted-foreground mt-2">
          Download your health information in PDF format. Perfect for sharing with providers or keeping personal records.
        </p>
      </div>

      <div className="grid gap-4">
        {exportOptions.map((option) => (
          <Card
            key={option.id}
            className="p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleExport(option)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                  {option.icon}
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">{option.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {option.description}
                  </p>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                disabled={exporting === option.id}
                onClick={(e) => {
                  e.stopPropagation();
                  handleExport(option);
                }}
              >
                {exporting === option.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : exported.includes(option.id) ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          <strong>Privacy Note:</strong> Your exported data is generated locally and downloaded directly to your device. 
          No copies are stored on our servers.
        </p>
      </div>
    </motion.div>
  );
};