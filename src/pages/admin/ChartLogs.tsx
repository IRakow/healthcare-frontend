import React from 'react';
import { AdminChartLogViewer } from '@/components/admin/AdminChartLogViewer';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const ChartLogsPage: React.FC = () => {
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
              <h1 className="text-3xl font-bold text-gray-900">Chart Logs</h1>
              <p className="text-muted-foreground">
                View and audit all patient chart entries across the system
              </p>
            </div>
          </div>
        </div>

        {/* Chart Log Viewer */}
        <AdminChartLogViewer />
      </div>
    </div>
  );
};