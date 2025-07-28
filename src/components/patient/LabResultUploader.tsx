import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Upload, 
  FileText, 
  X, 
  Eye, 
  Download,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/hooks/useUser';

interface LabResult {
  id: string;
  file_name: string;
  file_url: string;
  upload_date: string;
  test_date?: string;
  lab_name?: string;
  notes?: string;
  is_abnormal?: boolean;
  created_at: string;
}

export const LabResultUploader: React.FC = () => {
  const { userId } = useUser();
  const [results, setResults] = useState<LabResult[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [testDate, setTestDate] = useState('');
  const [labName, setLabName] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (userId) {
      fetchLabResults();
    }
  }, [userId]);

  const fetchLabResults = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('lab_results')
        .select('*')
        .eq('patient_id', userId)
        .order('test_date', { ascending: false });

      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      console.error('Failed to fetch lab results:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setSelectedFile(file);
    } else {
      alert('Please select a PDF file');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !userId) return;

    setUploading(true);
    try {
      // Upload to Supabase Storage
      const fileName = `${userId}/${Date.now()}_${selectedFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('lab-results')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('lab-results')
        .getPublicUrl(fileName);

      // Save metadata to database
      const { data: labResult, error: dbError } = await supabase
        .from('lab_results')
        .insert({
          patient_id: userId,
          file_name: selectedFile.name,
          file_url: publicUrl,
          upload_date: new Date().toISOString(),
          test_date: testDate || null,
          lab_name: labName || null,
          notes: notes || null,
          is_abnormal: false // This could be determined by AI analysis
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Add to timeline
      await supabase.from('patient_timeline').insert({
        patient_id: userId,
        type: 'lab_result',
        title: 'Lab Result Uploaded',
        content: `${selectedFile.name} from ${labName || 'Unknown Lab'}`,
        timestamp: new Date().toISOString(),
        importance: 'medium'
      });

      setResults([labResult, ...results]);
      
      // Reset form
      setSelectedFile(null);
      setTestDate('');
      setLabName('');
      setNotes('');
      
      // Trigger AI analysis (optional)
      analyzeLabResult(labResult.id, publicUrl);
    } catch (error) {
      console.error('Failed to upload lab result:', error);
      alert('Failed to upload lab result. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const analyzeLabResult = async (resultId: string, fileUrl: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-lab-result', {
        body: { resultId, fileUrl }
      });

      if (!error && data.hasAbnormalValues) {
        // Update the result with analysis
        await supabase
          .from('lab_results')
          .update({ 
            is_abnormal: true,
            ai_analysis: data.analysis 
          })
          .eq('id', resultId);

        // Update local state
        setResults(prev => prev.map(r => 
          r.id === resultId ? { ...r, is_abnormal: true } : r
        ));
      }
    } catch (error) {
      console.error('Failed to analyze lab result:', error);
    }
  };

  const deleteResult = async (resultId: string, fileName: string) => {
    if (!confirm('Are you sure you want to delete this lab result?')) return;

    try {
      // Extract file path from URL
      const filePath = `${userId}/${fileName}`;

      // Delete from storage
      await supabase.storage
        .from('lab-results')
        .remove([filePath]);

      // Delete from database
      const { error } = await supabase
        .from('lab_results')
        .delete()
        .eq('id', resultId);

      if (error) throw error;

      setResults(results.filter(r => r.id !== resultId));
    } catch (error) {
      console.error('Failed to delete lab result:', error);
      alert('Failed to delete lab result. Please try again.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur p-6 shadow space-y-6"
    >
      <h3 className="text-xl font-semibold text-gray-800">Lab Result Upload</h3>

      {/* Upload Form */}
      <Card className="p-4 border-dashed border-2 border-gray-300">
        {!selectedFile ? (
          <label className="flex flex-col items-center justify-center py-8 cursor-pointer">
            <Upload className="w-12 h-12 text-gray-400 mb-3" />
            <p className="text-sm text-gray-600 mb-2">Click to upload lab results</p>
            <p className="text-xs text-gray-500">PDF files only</p>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">{selectedFile.name}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedFile(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Test Date</label>
                <input
                  type="date"
                  value={testDate}
                  onChange={(e) => setTestDate(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Lab Name</label>
                <input
                  type="text"
                  value={labName}
                  onChange={(e) => setLabName(e.target.value)}
                  placeholder="e.g., Quest Diagnostics"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any specific concerns or notes..."
                rows={2}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              />
            </div>

            <Button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Lab Result
                </>
              )}
            </Button>
          </div>
        )}
      </Card>

      {/* Results List */}
      {loading ? (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
          <p className="text-sm text-muted-foreground mt-2">Loading lab results...</p>
        </div>
      ) : results.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          No lab results uploaded yet.
        </p>
      ) : (
        <div className="space-y-3">
          {results.map((result) => (
            <motion.div
              key={result.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex items-center justify-between p-4 rounded-lg border ${
                result.is_abnormal 
                  ? 'border-orange-200 bg-orange-50' 
                  : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText className={`w-5 h-5 ${
                  result.is_abnormal ? 'text-orange-600' : 'text-blue-600'
                }`} />
                <div>
                  <p className="font-medium text-sm">{result.file_name}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {result.lab_name && <span>{result.lab_name}</span>}
                    {result.test_date && (
                      <span>Test: {new Date(result.test_date).toLocaleDateString()}</span>
                    )}
                    <span>Uploaded: {new Date(result.upload_date).toLocaleDateString()}</span>
                  </div>
                  {result.is_abnormal && (
                    <div className="flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3 h-3 text-orange-600" />
                      <span className="text-xs text-orange-600">Abnormal values detected</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => window.open(result.file_url, '_blank')}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = result.file_url;
                    link.download = result.file_name;
                    link.click();
                  }}
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteResult(result.id, result.file_name)}
                >
                  <X className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};