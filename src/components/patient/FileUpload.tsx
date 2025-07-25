import { useState, useRef } from 'react';
import { Upload, X, FileText, Image, File } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fileUploadService, fileCategories, FileCategory } from '@/services/fileUploadService';

interface FileUploadProps {
  patientId: string;
  onUploadComplete?: () => void;
}

export function FileUpload({ patientId, onUploadComplete }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState<FileCategory>('medical_record');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError('');
      setSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError('');
    setSuccess(false);

    const result = await fileUploadService.uploadFile(
      selectedFile,
      patientId,
      category,
      description
    );

    if (result.success) {
      setSuccess(true);
      setSelectedFile(null);
      setDescription('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      if (onUploadComplete) {
        onUploadComplete();
      }
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(result.error || 'Upload failed');
    }

    setUploading(false);
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-8 w-8" />;
    if (type === 'application/pdf') return <FileText className="h-8 w-8 text-red-500" />;
    return <File className="h-8 w-8" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Upload Document</h3>

      {/* File Input Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          selectedFile ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx"
        />
        
        {selectedFile ? (
          <div className="space-y-2">
            {getFileIcon(selectedFile.type)}
            <p className="font-medium">{selectedFile.name}</p>
            <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedFile(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
            >
              <X className="h-4 w-4 mr-1" />
              Remove
            </Button>
          </div>
        ) : (
          <>
            <Upload className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600">Click to select a file</p>
            <p className="text-sm text-gray-500 mt-1">
              PDF, JPG, PNG, GIF, DOC, DOCX (max 10MB)
            </p>
          </>
        )}
      </div>

      {selectedFile && (
        <>
          {/* Category Selection */}
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as FileCategory)}
              className="w-full border rounded-md p-2"
            >
              {fileCategories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded-md p-2"
              rows={2}
              placeholder="Add any notes about this document..."
            />
          </div>

          {/* Upload Button */}
          <Button
            className="w-full mt-4"
            onClick={handleUpload}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </>
      )}

      {/* Messages */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md text-sm">
          Document uploaded successfully!
        </div>
      )}
    </Card>
  );
}