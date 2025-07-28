import React from 'react';
import { PDFExportPanel } from '@/components/patient/PDFExportPanel';
import { SecureLayout } from '@/components/layout/SecureLayout';
import { CommandBar } from '@/components/ai/CommandBar';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VisitSummary() {
  const navigate = useNavigate();

  // Sample data - in real app, would fetch from database
  const sampleSummaryData = [
    { label: 'Patient Name', value: 'John Doe' },
    { label: 'Visit Date', value: new Date().toLocaleDateString() },
    { label: 'Chief Complaint', value: 'Annual Physical Exam' },
    { label: 'Vital Signs', value: 'BP: 120/80, HR: 72, Temp: 98.6°F' },
    { label: 'Assessment', value: 'Healthy adult, no concerns' },
    { label: 'Plan', value: 'Continue current medications, follow up in 6 months' },
    { label: 'Provider', value: 'Dr. Sarah Smith' },
  ];

  return (
    <SecureLayout>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
        <CommandBar />
        
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/provider/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Visit Summary</h1>
          <p className="text-gray-600 mt-2">Export patient visit summaries as PDF documents</p>
        </div>

        <div className="grid gap-6">
          <PDFExportPanel summaryData={sampleSummaryData} />
        </div>
      </div>
    </SecureLayout>
  );
}