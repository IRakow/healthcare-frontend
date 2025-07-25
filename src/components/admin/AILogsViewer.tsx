import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Brain, Mic, Stethoscope, MessageSquare, Clock, Coins } from 'lucide-react';

interface AILog {
  id: string;
  created_at: string;
  user_email: string;
  user_name: string;
  action: string;
  model: string;
  input: string;
  output: string;
  tokens_used: number;
  duration_ms: number;
  employer_id: string;
  metadata: any;
}

export default function AILogsViewer() {
  const [aiLogs, setAILogs] = useState<AILog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAILogs();
  }, []);

  const fetchAILogs = async () => {
    try {
      const { data: aiLogs } = await supabase
        .from('ai_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (aiLogs) {
        setAILogs(aiLogs);
      }
    } catch (error) {
      console.error('Error fetching AI logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'query':
        return <MessageSquare className="w-4 h-4" />;
      case 'voice_transcription':
        return <Mic className="w-4 h-4" />;
      case 'symptom_check':
        return <Stethoscope className="w-4 h-4" />;
      default:
        return <Brain className="w-4 h-4" />;
    }
  };

  const getModelBadgeColor = (model: string) => {
    if (model?.includes('gpt')) return 'success';
    if (model?.includes('claude')) return 'primary';
    if (model?.includes('gemini')) return 'warning';
    return 'default';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">AI Interaction Logs</h2>
        <div className="text-sm text-gray-600">
          Total: {aiLogs.length} interactions
        </div>
      </div>

      {aiLogs.length === 0 ? (
        <Card>
          <p className="text-gray-600">No AI interactions logged yet.</p>
        </Card>
      ) : (
        aiLogs.map((log) => (
          <Card key={log.id} className="hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {getActionIcon(log.action)}
                <div>
                  <h3 className="font-medium">
                    {log.user_name || log.user_email || 'Anonymous'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm:ss')}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {log.model && (
                  <Badge variant={getModelBadgeColor(log.model)}>
                    {log.model}
                  </Badge>
                )}
                <Badge variant="outline">
                  {log.action.replace('_', ' ')}
                </Badge>
              </div>
            </div>

            {log.input && (
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700 mb-1">Input:</p>
                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  {log.input}
                </p>
              </div>
            )}

            {log.output && (
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700 mb-1">Output:</p>
                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded max-h-32 overflow-y-auto">
                  {log.output}
                </p>
              </div>
            )}

            <div className="flex items-center gap-4 text-xs text-gray-500">
              {log.tokens_used && (
                <div className="flex items-center gap-1">
                  <Coins className="w-3 h-3" />
                  {log.tokens_used} tokens
                </div>
              )}
              {log.duration_ms && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {(log.duration_ms / 1000).toFixed(2)}s
                </div>
              )}
            </div>
          </Card>
        ))
      )}
    </div>
  );
}