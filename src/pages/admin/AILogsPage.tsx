import { useState, useEffect } from 'react';
import { formatISO, subDays, format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Download, RefreshCw, TrendingUp, Brain } from 'lucide-react';

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

interface AIStats {
  totalCalls: number;
  successRate: number;
  modelUsage: Record<string, number>;
  actionBreakdown: Record<string, number>;
}

export default function AILogsPage() {
  const [logs, setLogs] = useState<AILog[]>([]);
  const [stats, setStats] = useState<AIStats>({
    totalCalls: 0,
    successRate: 0,
    modelUsage: {},
    actionBreakdown: {}
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    model: '',
    voice: '',
    role: '',
    success: '',
    action: '',
    startDate: formatISO(subDays(new Date(), 7)),
    endDate: formatISO(new Date())
  });

  useEffect(() => {
    loadLogs();
  }, [filters]);

  async function loadLogs() {
    setLoading(true);
    try {
      let query = supabase
        .from('ai_logs')
        .select(`
          *,
          user:user_id(full_name, email)
        `)
        .gte('created_at', filters.startDate)
        .lte('created_at', filters.endDate)
        .order('created_at', { ascending: false })
        .limit(100);

      if (filters.model) query = query.eq('model', filters.model);
      if (filters.voice) query = query.eq('voice_used', filters.voice);
      if (filters.role) query = query.eq('role', filters.role);
      if (filters.success !== '') query = query.eq('success', filters.success === 'true');
      if (filters.action) query = query.ilike('action', `%${filters.action}%`);

      const { data, error } = await query;

      if (error) throw error;
      setLogs(data || []);
      
      // Calculate stats
      if (data) {
        const stats: AIStats = {
          totalCalls: data.length,
          successRate: data.filter(log => log.success).length / data.length * 100,
          modelUsage: {},
          actionBreakdown: {}
        };
        
        data.forEach(log => {
          stats.modelUsage[log.model] = (stats.modelUsage[log.model] || 0) + 1;
          stats.actionBreakdown[log.action] = (stats.actionBreakdown[log.action] || 0) + 1;
        });
        
        setStats(stats);
      }
    } catch (error) {
      console.error('Error loading AI logs:', error);
    } finally {
      setLoading(false);
    }
  }

  async function exportLogs() {
    const csv = [
      ['Date', 'User', 'Role', 'Model', 'Voice', 'Action', 'Success', 'Input', 'Output'].join(','),
      ...logs.map(log => [
        format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss'),
        log.user?.full_name || log.user_id,
        log.role,
        log.model,
        log.voice_used || '',
        log.action,
        log.success ? 'Yes' : 'No',
        `"${log.input?.replace(/"/g, '""') || ''}"`,
        `"${log.output?.replace(/"/g, '""') || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  }

  const getModelColor = (model: string) => {
    switch (model?.toLowerCase()) {
      case 'gemini': return 'blue';
      case 'chatgpt': return 'green';
      case 'deepgram': return 'purple';
      default: return 'gray';
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('SOAP')) return '🩺';
    if (action.includes('Meditation')) return '🧘';
    if (action.includes('Voice')) return '🎤';
    if (action.includes('Lab')) return '🧪';
    if (action.includes('Risk')) return '⚠️';
    return '🤖';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Brain className="h-8 w-8 text-blue-600" />
          AI Usage Analytics
        </h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="text-sm text-gray-600">Total AI Calls</div>
          <div className="text-2xl font-bold">{stats.totalCalls}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Success Rate</div>
          <div className="text-2xl font-bold">{stats.successRate.toFixed(1)}%</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Most Used Model</div>
          <div className="text-2xl font-bold">
            {Object.entries(stats.modelUsage).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-gray-600">Top Action</div>
          <div className="text-2xl font-bold text-sm">
            {Object.entries(stats.actionBreakdown).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Input
            type="date"
            label="Start Date"
            value={filters.startDate.split('T')[0]}
            onChange={(e) => setFilters(prev => ({ 
              ...prev, 
              startDate: formatISO(new Date(e.target.value)) 
            }))}
          />
          
          <Input
            type="date"
            label="End Date"
            value={filters.endDate.split('T')[0]}
            onChange={(e) => setFilters(prev => ({ 
              ...prev, 
              endDate: formatISO(new Date(e.target.value)) 
            }))}
          />
          
          <Select
            label="Model"
            value={filters.model}
            onChange={(e) => setFilters(prev => ({ ...prev, model: e.target.value }))}
          >
            <option value="">All Models</option>
            <option value="Gemini">Gemini</option>
            <option value="ChatGPT">ChatGPT</option>
            <option value="Deepgram">Deepgram</option>
          </Select>
          
          <Select
            label="Role"
            value={filters.role}
            onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
          >
            <option value="">All Roles</option>
            <option value="patient">Patient</option>
            <option value="provider">Provider</option>
            <option value="admin">Admin</option>
            <option value="system">System</option>
          </Select>
          
          <Select
            label="Success"
            value={filters.success}
            onChange={(e) => setFilters(prev => ({ ...prev, success: e.target.value }))}
          >
            <option value="">All</option>
            <option value="true">Success</option>
            <option value="false">Failed</option>
          </Select>
          
          <Input
            label="Action"
            placeholder="Search action..."
            value={filters.action}
            onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
          />
        </div>
        
        <div className="flex gap-2 mt-4">
          <Button onClick={loadLogs} variant="secondary" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportLogs} variant="secondary" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </Card>

      {/* Logs Table */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Activity Log</h2>
        
        {loading ? (
          <div className="text-center py-8">Loading logs...</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No logs found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Date/Time</th>
                  <th className="text-left py-2">User</th>
                  <th className="text-left py-2">Action</th>
                  <th className="text-left py-2">Model</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b hover:bg-gray-50">
                    <td className="py-3">
                      {format(new Date(log.created_at), 'MMM d, HH:mm')}
                    </td>
                    <td className="py-3">
                      <div>
                        <div className="font-medium">{log.user?.full_name || 'System'}</div>
                        <div className="text-xs text-gray-500">{log.role}</div>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="mr-2">{getActionIcon(log.action)}</span>
                      {log.action}
                    </td>
                    <td className="py-3">
                      <Badge variant={getModelColor(log.model)}>
                        {log.model}
                      </Badge>
                      {log.voice_used && (
                        <div className="text-xs text-gray-500 mt-1">
                          Voice: {log.voice_used}
                        </div>
                      )}
                    </td>
                    <td className="py-3">
                      {log.success ? (
                        <Badge variant="green">Success</Badge>
                      ) : (
                        <Badge variant="red">Failed</Badge>
                      )}
                    </td>
                    <td className="py-3">
                      <details className="cursor-pointer">
                        <summary className="text-blue-600 hover:text-blue-800">
                          View
                        </summary>
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                          <div className="mb-2">
                            <strong>Input:</strong>
                            <pre className="whitespace-pre-wrap mt-1">
                              {log.input?.substring(0, 200)}
                              {log.input?.length > 200 && '...'}
                            </pre>
                          </div>
                          <div>
                            <strong>Output:</strong>
                            <pre className="whitespace-pre-wrap mt-1">
                              {log.output?.substring(0, 200)}
                              {log.output?.length > 200 && '...'}
                            </pre>
                          </div>
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