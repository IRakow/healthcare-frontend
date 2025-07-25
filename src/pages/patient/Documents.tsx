import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { FileUpload } from '@/components/patient/FileUpload';
import { FileViewer } from '@/components/patient/FileViewer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Filter } from 'lucide-react';
import { fileCategories, FileCategory } from '@/services/fileUploadService';

export default function Documents() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<FileCategory | 'all'>('all');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
    }
  }

  const handleUploadComplete = () => {
    // Refresh the file viewer
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Documents</h1>
          <p className="text-gray-600 mt-1">Upload and manage your medical documents</p>
        </div>
        <Button variant="ghost" onClick={() => navigate('/patient')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Upload Section */}
        <div className="md:col-span-1">
          {userId && (
            <FileUpload 
              patientId={userId} 
              onUploadComplete={handleUploadComplete}
            />
          )}
        </div>

        {/* Documents List */}
        <div className="md:col-span-2 space-y-4">
          {/* Category Filter */}
          <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as FileCategory | 'all')}
              className="border rounded px-3 py-1 text-sm flex-1"
            >
              <option value="all">All Categories</option>
              {fileCategories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* File Viewer */}
          {userId && (
            <FileViewer
              key={refreshKey}
              patientId={userId}
              category={selectedCategory === 'all' ? undefined : selectedCategory}
              showUpload={true}
            />
          )}
        </div>
      </div>
    </div>
  );
}