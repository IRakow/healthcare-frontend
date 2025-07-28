import React from 'react';
import { ExportChartLogPanel } from '@/components/admin/ExportChartLogPanel';
import { ArrowLeft, FileSearch, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const ChartExportPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/admin')}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Download className="w-8 h-8 text-primary" />
                Chart Export Center
              </h1>
              <p className="text-muted-foreground">
                Export patient chart logs and clinical data in multiple formats
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => navigate('/admin/chart-logs')}
            >
              <FileSearch className="w-4 h-4 mr-2" />
              View Chart Logs
            </Button>
          </div>
        </div>

        {/* Export Panel */}
        <ExportChartLogPanel />
      </div>
    </div>
  );
};