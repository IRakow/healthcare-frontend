import { useState, useEffect } from 'react';
import { formatISO, subDays, format } from 'date-fns';
import { supabase } from '@/lib/supabaseClient';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, RefreshCw, Brain } from 'lucide-react';

interface AILog {
  id: string;
  user_id: string;
  role: string;
  model: string;
  voice_used: string;
  action: string;
  input: string;
  output: string;
  success: boolean;
  created_at: string;
  user?: {
    full_name: string;
    email: string;
  };
}

export default function AILogsSimple() {
  const [logs, setLogs] = useState<AILog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    model: '',
    voice: '',
    role: '',
    success: '',
    startDate: formatISO(subDays(new Date(), 7)),
    endDate: formatISO(new Date())
  });

  useEffect(() => {
    loadLogs();
  }, [filters]);

  async function loadLogs() {
    setLoading(true);
    try {
      const query = supabase.from('ai_logs').select('*')
        .gte('created_at', filters.startDate)
        .lte('created_at', filters.endDate)
        .order('created_at', { ascending: false })
        .limit(100);

      if (filters.model) query.eq('model', filters.model);
      if (filters.voice) query.eq('voice_used', filters.voice);
      if (filters.role) query.eq('role', filters.role);
      if (filters.success) query.eq('success', filters.success === 'true');

      if (filters.search && filters.search.length > 2) {
        query.or(`input.ilike.%${filters.search}%,output.ilike.%${filters.search}%`);
      }

      const { data } = await query;
      setLogs(data || []);
    } catch (error) {
      console.error('Error loading AI logs:', error);
    } finally {
      setLoading(false);
    }
  }

  async function exportLogs() {
    const csv = [
      ['Date', 'User', 'Role', 'Model', 'Voice', 'Action', 'Success'].join(','),
      ...logs.map(log => [
        format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss'),
        log.user_id || 'System',
        log.role,
        log.model,
        log.voice_used || '',
        log.action,
        log.success ? 'Yes' : 'No'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  }

  const getModelBadge = (model: string) => {
    const colors: Record<string, string> = {
      'Gemini': 'bg-blue-100 text-blue-700',
      'ChatGPT': 'bg-green-100 text-green-700',
      'Deepgram': 'bg-purple-100 text-purple-700'
    };
    return colors[model] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Brain className="h-8 w-8 text-blue-600" />
          AI Usage Logs
        </h1>
        <div className="flex gap-2">
          <Button onClick={loadLogs} variant="secondary" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportLogs} variant="secondary" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          <Input 
            placeholder="Search..." 
            value={filters.search || ''} 
            onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))} 
          />
          <select 
            value={filters.model} 
            onChange={(e) => setFilters(f => ({ ...f, model: e.target.value }))}
            className="border rounded px-3 py-2"
          >
            <option value="">All Models</option>
            <option value="Gemini">Gemini</option>
            <option value="ChatGPT">ChatGPT</option>
          </select>
          <select 
            value={filters.voice} 
            onChange={(e) => setFilters(f => ({ ...f, voice: e.target.value }))}
            className="border rounded px-3 py-2"
          >
            <option value="">All Voices</option>
            <option value="Rachel">Rachel</option>
            <option value="Bella">Bella</option>
            <option value="Adam">Adam</option>
          </select>
          <select 
            value={filters.role} 
            onChange={(e) => setFilters(f => ({ ...f, role: e.target.value }))}
            className="border rounded px-3 py-2"
          >
            <option value="">All Roles</option>
            <option value="patient">Patient</option>
            <option value="provider">Provider</option>
            <option value="admin">Admin</option>
          </select>
          <select 
            value={filters.success} 
            onChange={(e) => setFilters(f => ({ ...f, success: e.target.value }))}
            className="border rounded px-3 py-2"
          >
            <option value="">Success & Failures</option>
            <option value="true">✅ Success</option>
            <option value="false">❌ Failed</option>
          </select>
          <Input 
            type="date" 
            value={filters.startDate.split('T')[0]} 
            onChange={(e) => setFilters(f => ({ ...f, startDate: formatISO(new Date(e.target.value)) }))} 
          />
          <Input 
            type="date" 
            value={filters.endDate.split('T')[0]} 
            onChange={(e) => setFilters(f => ({ ...f, endDate: formatISO(new Date(e.target.value)) }))} 
          />
        </div>
      </Card>

      {/* Logs Table */}
      <Card className="p-6">
        {loading ? (
          <div className="text-center py-8">Loading logs...</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No logs found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm font-medium">
                  <th className="pb-3">Time</th>
                  <th className="pb-3">User</th>
                  <th className="pb-3">Action</th>
                  <th className="pb-3">Model</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 text-sm">
                      {format(new Date(log.created_at), 'MMM d, HH:mm')}
                    </td>
                    <td className="py-3">
                      <div className="text-sm font-medium">{log.user_id || 'System'}</div>
                      <div className="text-xs text-gray-500">{log.role}</div>
                    </td>
                    <td className="py-3 text-sm">{log.action}</td>
                    <td className="py-3">
                      <span className={`inline-block px-2 py-1 text-xs rounded ${getModelBadge(log.model)}`}>
                        {log.model}
                      </span>
                      {log.voice_used && (
                        <div className="text-xs text-gray-500 mt-1">{log.voice_used}</div>
                      )}
                    </td>
                    <td className="py-3">
                      {log.success ? (
                        <span className="text-green-600">✅</span>
                      ) : (
                        <span className="text-red-600">❌</span>
                      )}
                    </td>
                    <td className="py-3">
                      <details className="text-sm">
                        <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                          View
                        </summary>
                        <div className="mt-2 p-2 bg-gray-50 rounded">
                          {log.input && (
                            <div className="mb-2">
                              <span className="font-medium">Input:</span>
                              <div className="text-xs text-gray-600 mt-1">
                                {log.input.substring(0, 100)}...
                              </div>
                            </div>
                          )}
                          {log.output && (
                            <div>
                              <span className="font-medium">Output:</span>
                              <div className="text-xs text-gray-600 mt-1">
                                {log.output.substring(0, 100)}...
                              </div>
                            </div>
                          )}
                        </div>
                      </details>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}