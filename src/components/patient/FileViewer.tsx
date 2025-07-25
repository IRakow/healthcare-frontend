import { useState, useEffect } from 'react';
import { FileText, Image, Download, Trash2, Eye, Calendar, Tag } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { fileUploadService, fileCategories, FileCategory } from '@/services/fileUploadService';

interface FileViewerProps {
  patientId: string;
  category?: FileCategory;
  showUpload?: boolean;
}

export function FileViewer({ patientId, category, showUpload = false }: FileViewerProps) {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadFiles();
  }, [patientId, category]);

  async function loadFiles() {
    setLoading(true);
    const result = await fileUploadService.getFiles(patientId, category);
    if (result.success) {
      setFiles(result.data || []);
    }
    setLoading(false);
  }

  async function handleView(file: any) {
    const result = await fileUploadService.getFileUrl(file.url);
    if (result.success && result.url) {
      setPreviewUrl(result.url);
      setSelectedFile(file);
    }
  }

  async function handleDownload(file: any) {
    const result = await fileUploadService.getFileUrl(file.url);
    if (result.success && result.url) {
      const a = document.createElement('a');
      a.href = result.url;
      a.download = file.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }

  async function handleDelete(file: any) {
    if (!confirm(`Are you sure you want to delete ${file.filename}?`)) return;
    
    setDeleting(file.id);
    const result = await fileUploadService.deleteFile(file.id, file.url, patientId);
    if (result.success) {
      setFiles(files.filter(f => f.id !== file.id));
    }
    setDeleting(null);
  }

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) return <Image className="h-5 w-5" />;
    return <FileText className="h-5 w-5" />;
  };


  const getCategoryBadgeColor = (cat: string) => {
    const colors: Record<string, string> = {
      lab_result: 'bg-purple-100 text-purple-700',
      imaging: 'bg-blue-100 text-blue-700',
      prescription: 'bg-green-100 text-green-700',
      insurance: 'bg-orange-100 text-orange-700',
      medical_record: 'bg-indigo-100 text-indigo-700',
      vaccination: 'bg-pink-100 text-pink-700',
      other: 'bg-gray-100 text-gray-700'
    };
    return colors[cat] || colors.other;
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500">
        Loading documents...
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <Card className="p-6 text-center">
        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No documents uploaded yet</p>
        {showUpload && (
          <p className="text-sm text-gray-400 mt-1">
            Upload your medical documents to keep them organized
          </p>
        )}
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {files.map((file) => (
          <Card key={file.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-50 rounded">
                  {getFileIcon(file.filename)}
                </div>
                
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{file.filename}</h4>
                  
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(file.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className={getCategoryBadgeColor(file.type)}>
                      {fileCategories.find(c => c.value === file.type)?.label || file.type}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleView(file)}
                  title="View"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownload(file)}
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(file)}
                  disabled={deleting === file.id}
                  title="Delete"
                  className="hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Preview Modal */}
      {selectedFile && previewUrl && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setSelectedFile(null);
            setPreviewUrl('');
          }}
        >
          <div
            className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold">{selectedFile.filename}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl('');
                }}
              >
                ✕
              </Button>
            </div>
            
            <div className="p-4 overflow-auto max-h-[calc(90vh-120px)]">
              {(() => {
                const ext = selectedFile.filename.split('.').pop()?.toLowerCase();
                const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(ext || '');
                const isPdf = ext === 'pdf';
                
                if (isImage) {
                  return (
                    <img
                      src={previewUrl}
                      alt={selectedFile.filename}
                      className="max-w-full mx-auto"
                    />
                  );
                } else if (isPdf) {
                  return (
                    <iframe
                      src={previewUrl}
                      className="w-full h-[70vh]"
                      title={selectedFile.filename}
                    />
                  );
                } else {
                  return (
                    <div className="text-center py-8">
                      <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Preview not available for this file type</p>
                      <Button
                        className="mt-4"
                        onClick={() => handleDownload(selectedFile)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download File
                      </Button>
                    </div>
                  );
                }
              })()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}