import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Clock, User, ChevronDown, ChevronUp, Calendar, Edit, Download, Loader2, Search, Filter } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useUser } from '@/hooks/useUser';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface SOAPNote {
  id: string;
  patient_id: string;
  patient_name: string;
  provider_id: string;
  appointment_id: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  follow_up_date?: string;
  follow_up_instructions?: string;
  diagnosis_codes?: string[];
  procedure_codes?: string[];
  medications_prescribed?: string[];
  labs_ordered?: string[];
  created_at: string;
  updated_at: string;
  is_finalized: boolean;
  chief_complaint?: string;
  vitals?: {
    blood_pressure?: string;
    heart_rate?: number;
    temperature?: number;
    weight?: number;
    height?: number;
  };
}

export const SOAPSummaryViewer: React.FC = () => {
  const { userId } = useUser();
  const [notes, setNotes] = useState<SOAPNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [expandedNote, setExpandedNote] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    thisWeek: 0,
    needsFollowUp: 0,
    finalized: 0
  });

  useEffect(() => {
    if (userId) {
      loadSOAPNotes();
      subscribeToNoteUpdates();
    }
  }, [userId, dateFilter]);

  const loadSOAPNotes = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('soap_notes')
        .select(`
          *,
          patient:patients(
            id,
            user:auth.users(
              user_metadata
            )
          ),
          appointment:appointments(
            chief_complaint,
            appointment_date
          ),
          vitals:vitals(
            blood_pressure_systolic,
            blood_pressure_diastolic,
            heart_rate,
            temperature,
            weight,
            height
          )
        `)
        .eq('provider_id', userId)
        .order('created_at', { ascending: false });

      // Apply date filter
      if (dateFilter !== 'all') {
        const now = new Date();
        let startDate = new Date();
        
        switch (dateFilter) {
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
        
        query = query.gte('created_at', startDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedNotes = (data || []).map(note => ({
        ...note,
        patient_name: note.patient?.user?.user_metadata?.full_name || 'Unknown Patient',
        chief_complaint: note.appointment?.chief_complaint,
        vitals: note.vitals?.[0] ? {
          blood_pressure: `${note.vitals[0].blood_pressure_systolic}/${note.vitals[0].blood_pressure_diastolic}`,
          heart_rate: note.vitals[0].heart_rate,
          temperature: note.vitals[0].temperature,
          weight: note.vitals[0].weight,
          height: note.vitals[0].height
        } : undefined
      }));

      setNotes(formattedNotes);
      
      // Calculate stats
      const thisWeekDate = new Date();
      thisWeekDate.setDate(thisWeekDate.getDate() - 7);
      
      setStats({
        total: formattedNotes.length,
        thisWeek: formattedNotes.filter(n => new Date(n.created_at) > thisWeekDate).length,
        needsFollowUp: formattedNotes.filter(n => n.follow_up_date).length,
        finalized: formattedNotes.filter(n => n.is_finalized).length
      });
    } catch (error) {
      console.error('Failed to load SOAP notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToNoteUpdates = () => {
    const channel = supabase
      .channel(`provider-soap-notes:${userId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'soap_notes',
          filter: `provider_id=eq.${userId}`
        }, 
        () => {
          loadSOAPNotes();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  };

  const downloadSOAPNote = async (noteId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-soap-pdf', {
        body: { noteId }
      });

      if (error) throw error;

      // Create download link
      const blob = new Blob([data.pdf], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `soap-note-${noteId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download SOAP note:', error);
      alert('Failed to download SOAP note. Please try again.');
    }
  };

  const filteredNotes = notes.filter(note => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      note.patient_name.toLowerCase().includes(search) ||
      note.chief_complaint?.toLowerCase().includes(search) ||
      note.assessment.toLowerCase().includes(search) ||
      note.diagnosis_codes?.some(code => code.toLowerCase().includes(search))
    );
  });

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
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" /> SOAP Notes
        </h3>
        <Button variant="outline" size="sm" onClick={() => window.location.href = '/provider/soap/new'}>
          <Edit className="w-4 h-4 mr-2" />
          New Note
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
          <p className="text-xs text-muted-foreground">Total Notes</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.thisWeek}</p>
          <p className="text-xs text-muted-foreground">This Week</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-orange-600">{stats.needsFollowUp}</p>
          <p className="text-xs text-muted-foreground">Follow-ups</p>
        </Card>
        <Card className="p-3 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.finalized}</p>
          <p className="text-xs text-muted-foreground">Finalized</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search patient, diagnosis, or chief complaint..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          className="border rounded-lg px-3 py-2 text-sm"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      {/* Notes List */}
      {filteredNotes.length === 0 ? (
        <Card className="p-8 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-muted-foreground">
            {searchTerm ? 'No notes match your search' : 'No SOAP notes yet'}
          </p>
        </Card>
      ) : (
        <ul className="space-y-4">
          <AnimatePresence>
            {filteredNotes.map((note) => (
              <motion.li
                key={note.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white border rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                <div 
                  className="p-4 cursor-pointer"
                  onClick={() => setExpandedNote(expandedNote === note.id ? null : note.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-800">{note.patient_name}</span>
                        {note.is_finalized && (
                          <Badge variant="default" className="text-xs">Finalized</Badge>
                        )}
                        {note.follow_up_date && (
                          <Badge variant="outline" className="text-xs">Follow-up needed</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(note.created_at).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(note.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      {expandedNote === note.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  
                  {note.chief_complaint && (
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Chief Complaint:</span> {note.chief_complaint}
                    </p>
                  )}
                  
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                    <span className="font-medium">Assessment:</span> {note.assessment}
                  </p>
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                  {expandedNote === note.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-gray-200 bg-gray-50"
                    >
                      <div className="p-4 space-y-4">
                        {/* Vitals */}
                        {note.vitals && (
                          <div>
                            <h5 className="font-medium text-sm text-gray-700 mb-2">Vitals</h5>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                              {note.vitals.blood_pressure && (
                                <div>
                                  <p className="text-muted-foreground">BP</p>
                                  <p className="font-medium">{note.vitals.blood_pressure} mmHg</p>
                                </div>
                              )}
                              {note.vitals.heart_rate && (
                                <div>
                                  <p className="text-muted-foreground">HR</p>
                                  <p className="font-medium">{note.vitals.heart_rate} bpm</p>
                                </div>
                              )}
                              {note.vitals.temperature && (
                                <div>
                                  <p className="text-muted-foreground">Temp</p>
                                  <p className="font-medium">{note.vitals.temperature}°F</p>
                                </div>
                              )}
                              {note.vitals.weight && (
                                <div>
                                  <p className="text-muted-foreground">Weight</p>
                                  <p className="font-medium">{note.vitals.weight} lbs</p>
                                </div>
                              )}
                              {note.vitals.height && (
                                <div>
                                  <p className="text-muted-foreground">Height</p>
                                  <p className="font-medium">{note.vitals.height} in</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* SOAP Content */}
                        <div className="space-y-3">
                          <div>
                            <h5 className="font-medium text-sm text-gray-700">Subjective</h5>
                            <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{note.subjective}</p>
                          </div>
                          <div>
                            <h5 className="font-medium text-sm text-gray-700">Objective</h5>
                            <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{note.objective}</p>
                          </div>
                          <div>
                            <h5 className="font-medium text-sm text-gray-700">Assessment</h5>
                            <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{note.assessment}</p>
                          </div>
                          <div>
                            <h5 className="font-medium text-sm text-gray-700">Plan</h5>
                            <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{note.plan}</p>
                          </div>
                        </div>

                        {/* Additional Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          {note.diagnosis_codes && note.diagnosis_codes.length > 0 && (
                            <div>
                              <h5 className="font-medium text-gray-700">Diagnosis Codes</h5>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {note.diagnosis_codes.map((code, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">
                                    {code}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {note.medications_prescribed && note.medications_prescribed.length > 0 && (
                            <div>
                              <h5 className="font-medium text-gray-700">Medications Prescribed</h5>
                              <ul className="list-disc list-inside text-gray-600 mt-1">
                                {note.medications_prescribed.map((med, i) => (
                                  <li key={i}>{med}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {note.labs_ordered && note.labs_ordered.length > 0 && (
                            <div>
                              <h5 className="font-medium text-gray-700">Labs Ordered</h5>
                              <ul className="list-disc list-inside text-gray-600 mt-1">
                                {note.labs_ordered.map((lab, i) => (
                                  <li key={i}>{lab}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {note.follow_up_date && (
                            <div>
                              <h5 className="font-medium text-gray-700">Follow-up</h5>
                              <p className="text-gray-600 mt-1">
                                {new Date(note.follow_up_date).toLocaleDateString()}
                                {note.follow_up_instructions && (
                                  <span className="block text-xs mt-1">{note.follow_up_instructions}</span>
                                )}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = `/provider/soap/${note.id}/edit`;
                            }}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadSOAPNote(note.id);
                            }}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download PDF
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