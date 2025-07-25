import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Spinner } from '@/components/ui/spinner';

interface TranscriptViewerProps {
  patientId: string;
  appointmentId?: string;
  limit?: number;
}

interface TranscriptEvent {
  id: string;
  created_at: string;
  data: {
    appointment_id?: string;
    summary: string;
    rawTranscript: string;
    duration?: number;
    timestamp: string;
  };
}

export function TranscriptViewer({ patientId, appointmentId, limit = 10 }: TranscriptViewerProps) {
  const [transcripts, setTranscripts] = useState<TranscriptEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadTranscripts();
  }, [patientId, appointmentId]);

  async function loadTranscripts() {
    try {
      let query = supabase
        .from('patient_timeline_events')
        .select('*')
        .eq('patient_id', patientId)
        .eq('type', 'ai')
        .eq('label', 'Visit Transcript')
        .order('created_at', { ascending: false })
        .limit(limit);

      // Filter by appointment if specified
      if (appointmentId) {
        query = query.eq('data->appointment_id', appointmentId);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      setTranscripts(data || []);
    } catch (error) {
      console.error('Error loading transcripts:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <Spinner />
      </div>
    );
  }

  if (transcripts.length === 0) {
    return (
      <Card>
        <div className="p-6 text-center">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No transcripts available</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold flex items-center gap-2">
        <FileText className="h-5 w-5" />
        Visit Transcripts
      </h3>
      
      {transcripts.map((transcript) => (
        <Card key={transcript.id}>
          <div className="p-4">
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-medium">
                  {format(new Date(transcript.data.timestamp || transcript.created_at), 'MMM d, yyyy h:mm a')}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                  {transcript.data.duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      ~{transcript.data.duration} min
                    </span>
                  )}
                  <span>{transcript.data.rawTranscript.split(' ').length} words</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpandedId(expandedId === transcript.id ? null : transcript.id)}
              >
                {expandedId === transcript.id ? (
                  <>
                    <ChevronUp className="h-4 w-4 mr-1" />
                    Hide
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4 mr-1" />
                    View
                  </>
                )}
              </Button>
            </div>

            {/* Summary */}
            <div className="bg-blue-50 rounded-lg p-3 mb-3">
              <h4 className="font-medium text-sm mb-2">Summary</h4>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {transcript.data.summary}
              </p>
            </div>

            {/* Full Transcript (expandable) */}
            {expandedId === transcript.id && (
              <div className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-medium text-sm mb-2">Full Transcript</h4>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {transcript.data.rawTranscript}
                </p>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}