import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FlaskConical, AlertCircle, CheckCircle, Clock, FileText, Download, Eye, ChevronDown, ChevronUp, Loader2, Search, Filter, TrendingUp, TrendingDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/hooks/useUser';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface LabResult {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_email: string;
  test_name: string;
  lab_name: string;
  test_date: string;
  upload_date: string;
  file_url: string;
  status: 'pending' | 'reviewed' | 'flagged';
  is_abnormal: boolean;
  critical_values?: string[];
  ai_summary?: string;
  ai_analysis?: {
    abnormalValues: Array<{
      name: string;
      value: string;
      reference: string;
      severity: 'mild' | 'moderate' | 'severe';
    }>;
    recommendations: string[];
    followUpNeeded: boolean;
  };
  provider_notes?: string;
  reviewed_at?: string;
}

interface FilterOptions {
  status: string;
  abnormalOnly: boolean;
  searchTerm: string;
  dateRange: string;
  patientId?: string;
}

export const LabReviewPanel: React.FC = () => {
  const { userId } = useUser();
  const [labs, setLabs] = useState<LabResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedLab, setExpandedLab] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    status: 'all',
    abnormalOnly: false,
    searchTerm: '',
    dateRange: 'week'
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    abnormal: 0,
    critical: 0
  });

  useEffect(() => {
    if (userId) {
      loadLabResults();
      subscribeToLabUpdates();
    }
  }, [userId, filters]);

  const loadLabResults = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('lab_results')
        .select(`
          *,
          patient:patients(
            id,
            user:auth.users(
              email,
              user_metadata
            )
          ),
          review:lab_reviews(
            status,
            provider_notes,
            reviewed_at
          )
        `)
        .order('test_date', { ascending: false });

      // Apply filters
      if (filters.status !== 'all') {
        query = query.eq('review.status', filters.status);
      }

      if (filters.abnormalOnly) {
        query = query.eq('is_abnormal', true);
      }

      if (filters.patientId) {
        query = query.eq('patient_id', filters.patientId);
      }

      // Apply date range filter
      if (filters.dateRange !== 'all') {
        const now = new Date();
        let startDate = new Date();
        
        switch (filters.dateRange) {
          case 'today':
            startDate.setHours(0, 0, 0, 0);
            break;
          case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
        }
        
        query = query.gte('test_date', startDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      // Process and format lab results
      const formattedLabs = await Promise.all((data || []).map(async (lab) => {
        // Check if AI analysis exists, if not trigger it
        if (!lab.ai_analysis && lab.file_url) {
          triggerAIAnalysis(lab.id, lab.file_url);
        }

        return {
          ...lab,
          patient_name: lab.patient?.user?.user_metadata?.full_name || 'Unknown Patient',
          patient_email: lab.patient?.user?.email || '',
          status: lab.review?.status || 'pending',
          provider_notes: lab.review?.provider_notes,
          reviewed_at: lab.review?.reviewed_at
        };
      }));

      // Apply search filter
      let filteredLabs = formattedLabs;
      if (filters.searchTerm) {
        const search = filters.searchTerm.toLowerCase();
        filteredLabs = formattedLabs.filter(lab =>
          lab.patient_name.toLowerCase().includes(search) ||
          lab.test_name.toLowerCase().includes(search) ||
          lab.lab_name.toLowerCase().includes(search)
        );
      }

      setLabs(filteredLabs);

      // Calculate stats
      setStats({
        total: filteredLabs.length,
        pending: filteredLabs.filter(l => l.status === 'pending').length,
        abnormal: filteredLabs.filter(l => l.is_abnormal).length,
        critical: filteredLabs.filter(l => l.critical_values && l.critical_values.length > 0).length
      });
    } catch (error) {
      console.error('Failed to load lab results:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToLabUpdates = () => {
    const channel = supabase
      .channel(`provider-labs:${userId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'lab_results'
        }, 
        () => {
          loadLabResults();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  };

  const triggerAIAnalysis = async (labId: string, fileUrl: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-lab-result', {
        body: { resultId: labId, fileUrl }
      });

      if (!error && data) {
        // Update will trigger a reload through the subscription
      }
    } catch (error) {
      console.error('Failed to trigger AI analysis:', error);
    }
  };

  const updateLabStatus = async (labId: string, status: LabResult['status'], notes?: string) => {
    try {
      const { error } = await supabase
        .from('lab_reviews')
        .upsert({
          lab_result_id: labId,
          provider_id: userId,
          status,
          provider_notes: notes,
          reviewed_at: new Date().toISOString()
        });

      if (error) throw error;

      // Update local state
      setLabs(labs.map(lab => 
        lab.id === labId 
          ? { ...lab, status, provider_notes: notes, reviewed_at: new Date().toISOString() }
          : lab
      ));
    } catch (error) {
      console.error('Failed to update lab status:', error);
    }
  };

  const downloadLabResult = (lab: LabResult) => {
    const link = document.createElement('a');
    link.href = lab.file_url;
    link.download = `${lab.patient_name}_${lab.test_name}_${lab.test_date}.pdf`;
    link.click();
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'severe':
        return 'text-red-600 bg-red-50';
      case 'moderate':
        return 'text-orange-600 bg-orange-50';
      case 'mild':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'reviewed':
        return <Badge variant="default" className="text-xs">Reviewed</Badge>;
      case 'flagged':
        return <Badge variant="destructive" className="text-xs">Flagged</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">Pending Review</Badge>;
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur p-6 shadow space-y-6"
    >
      <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
        <FlaskConical className="w-5 h-5 text-primary" /> Lab Review Queue
      </h3>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          <p className="text-xs text-muted-foreground">Total Labs</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          <p className="text-xs text-muted-foreground">Pending Review</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-orange-600">{stats.abnormal}</p>
          <p className="text-xs text-muted-foreground">Abnormal</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
          <p className="text-xs text-muted-foreground">Critical</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search patient or test name..."
            value={filters.searchTerm}
            onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
            className="pl-9"
          />
        </div>
        <select
          className="border rounded-lg px-3 py-2 text-sm"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending Review</option>
          <option value="reviewed">Reviewed</option>
          <option value="flagged">Flagged</option>
        </select>
        <select
          className="border rounded-lg px-3 py-2 text-sm"
          value={filters.dateRange}
          onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
        >
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="all">All Time</option>
        </select>
        <Button
          variant={filters.abnormalOnly ? "default" : "outline"}
          size="sm"
          onClick={() => setFilters({ ...filters, abnormalOnly: !filters.abnormalOnly })}
        >
          <AlertCircle className="w-4 h-4 mr-1" />
          Abnormal Only
        </Button>
      </div>

      {/* Lab Results */}
      {labs.length === 0 ? (
        <Card className="p-8 text-center">
          <FlaskConical className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-muted-foreground">No lab results to review</p>
        </Card>
      ) : (
        <ul className="space-y-4">
          <AnimatePresence>
            {labs.map((lab) => (
              <motion.li
                key={lab.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`bg-white border rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow ${
                  lab.critical_values && lab.critical_values.length > 0 ? 'border-red-200' : ''
                }`}
              >
                <div 
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedLab(expandedLab === lab.id ? null : lab.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-800">{lab.patient_name}</span>
                        {getStatusBadge(lab.status)}
                        {lab.is_abnormal && (
                          <Badge variant="outline" className="text-xs bg-orange-50">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Abnormal
                          </Badge>
                        )}
                        {lab.critical_values && lab.critical_values.length > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            Critical
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm space-y-1">
                        <p className="text-gray-700">
                          <span className="font-medium">{lab.test_name}</span> • {lab.lab_name}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Test Date: {new Date(lab.test_date).toLocaleDateString()}</span>
                          <span>Uploaded: {new Date(lab.upload_date).toLocaleDateString()}</span>
                          {lab.reviewed_at && (
                            <span className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Reviewed: {new Date(lab.reviewed_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* AI Summary Preview */}
                      {lab.ai_summary && (
                        <p className="text-sm text-blue-600 mt-2 line-clamp-2">
                          AI Summary: {lab.ai_summary}
                        </p>
                      )}
                    </div>
                    <Button variant="ghost" size="icon">
                      {expandedLab === lab.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                  {expandedLab === lab.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-gray-200 bg-gray-50"
                    >
                      <div className="p-4 space-y-4">
                        {/* AI Analysis */}
                        {lab.ai_analysis && (
                          <div className="space-y-3">
                            {/* Abnormal Values */}
                            {lab.ai_analysis.abnormalValues && lab.ai_analysis.abnormalValues.length > 0 && (
                              <div>
                                <h5 className="font-medium text-sm text-gray-700 mb-2">Abnormal Values</h5>
                                <div className="space-y-2">
                                  {lab.ai_analysis.abnormalValues.map((value, i) => (
                                    <div key={i} className={`p-2 rounded-lg text-sm ${getSeverityColor(value.severity)}`}>
                                      <div className="flex justify-between items-start">
                                        <span className="font-medium">{value.name}</span>
                                        <span className="font-mono">{value.value}</span>
                                      </div>
                                      <p className="text-xs mt-1">Reference: {value.reference}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Recommendations */}
                            {lab.ai_analysis.recommendations && lab.ai_analysis.recommendations.length > 0 && (
                              <div>
                                <h5 className="font-medium text-sm text-gray-700 mb-2">AI Recommendations</h5>
                                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                  {lab.ai_analysis.recommendations.map((rec, i) => (
                                    <li key={i}>{rec}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {lab.ai_analysis.followUpNeeded && (
                              <Card className="p-3 bg-yellow-50 border-yellow-200">
                                <p className="text-sm font-medium text-yellow-800">
                                  ⚠️ Follow-up recommended based on results
                                </p>
                              </Card>
                            )}
                          </div>
                        )}

                        {/* Provider Notes */}
                        {lab.provider_notes && (
                          <div>
                            <h5 className="font-medium text-sm text-gray-700 mb-1">Provider Notes</h5>
                            <p className="text-sm text-gray-600">{lab.provider_notes}</p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(lab.file_url, '_blank');
                            }}
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View PDF
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadLabResult(lab);
                            }}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                          {lab.status === 'pending' && (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const notes = prompt('Add review notes (optional):');
                                  updateLabStatus(lab.id, 'reviewed', notes || undefined);
                                }}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Mark Reviewed
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const notes = prompt('Reason for flagging:');
                                  if (notes) {
                                    updateLabStatus(lab.id, 'flagged', notes);
                                  }
                                }}
                              >
                                Flag for Follow-up
                              </Button>
                            </>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = `/provider/patient/${lab.patient_id}/chart`;
                            }}
                          >
                            View Patient Chart
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </motion.div>
  );
};