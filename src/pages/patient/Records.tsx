import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';
import { FileText, Download, Eye, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MedicalRecord {
  id: string;
  title: string;
  type: string;
  date: string;
  provider_name?: string;
  file_url?: string;
  created_at: string;
}

export default function Records() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecords();
  }, []);

  async function fetchRecords() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('medical_records')
        .select('*')
        .eq('patient_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setLoading(false);
    }
  }

  const recordTypes = ['All', 'Lab Results', 'Visit Notes', 'Imaging', 'Prescriptions', 'Other'];

  const filteredRecords = activeTab === 'All' 
    ? records 
    : records.filter(r => r.type === activeTab);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Lab Results': return 'text-blue-600 bg-blue-50';
      case 'Visit Notes': return 'text-green-600 bg-green-50';
      case 'Imaging': return 'text-purple-600 bg-purple-50';
      case 'Prescriptions': return 'text-orange-600 bg-orange-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Medical Records</h1>
        <Button onClick={() => navigate('/patient/documents')}>
          <FileText className="h-4 w-4 mr-2" />
          Upload Document
        </Button>
      </div>

      <Tabs tabs={recordTypes} active={activeTab} onSelect={setActiveTab} />

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredRecords.length === 0 ? (
        <Card>
          <div className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No {activeTab === 'All' ? '' : activeTab.toLowerCase()} records found</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => navigate('/patient/documents')}
            >
              Upload your first document
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredRecords.map((record) => (
            <Card key={record.id} className="hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{record.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(record.type)}`}>
                        {record.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(record.date).toLocaleDateString()}
                      </span>
                      {record.provider_name && (
                        <span>Provider: {record.provider_name}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {record.file_url && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(record.file_url, '_blank')}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = record.file_url!;
                            link.download = record.title;
                            link.click();
                          }}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}