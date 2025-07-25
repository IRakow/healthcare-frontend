import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

export default function SuperPanelSimple() {
  const [tab, setTab] = useState('Users');
  const [loading, setLoading] = useState(false);

  // Sample data for users only
  const [users] = useState([
    { id: '1', name: 'Ian Rakow', email: 'ian@owner.com', role: 'owner' },
    { id: '2', name: 'Dr. Rivas', email: 'rivas@provider.com', role: 'provider' },
    { id: '3', name: 'Leo Chavez', email: 'leo@patient.com', role: 'patient' },
  ]);

  const [aiLogs, setAILogs] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  useEffect(() => {
    if (tab === 'AI Logs') {
      fetchAILogs();
    } else if (tab === 'Invoices') {
      fetchInvoices();
    } else if (tab === 'Audit Logs') {
      fetchAuditLogs();
    }
  }, [tab]);

  const fetchAILogs = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('ai_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (data) {
        setAILogs(data);
      }
    } catch (error) {
      console.error('Error fetching AI logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('invoices')
        .select('*, employer:employers(name)')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (data) {
        setInvoices(data);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('audit_log_summary')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (data) {
        setAuditLogs(data);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Admin SuperPanel</h1>
      <Tabs tabs={['Users', 'AI Logs', 'Invoices', 'Audit Logs']} active={tab} onSelect={setTab} />

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {/* USERS */}
          {tab === 'Users' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map((user) => (
                <Card key={user.id} title={user.name}>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <Badge 
                    label={user.role} 
                    color={user.role === 'owner' ? 'blue' : user.role === 'provider' ? 'yellow' : 'green'} 
                  />
                </Card>
              ))}
            </div>
          )}

          {/* AI LOGS */}
          {tab === 'AI Logs' && (
            <div className="space-y-4">
              {aiLogs.length === 0 ? (
                <Card title="No AI Logs">
                  <p className="text-sm text-gray-600">No AI interactions logged yet.</p>
                </Card>
              ) : (
                aiLogs.map((log) => (
                  <Card key={log.id} title={`🧠 ${log.user_name || log.user_email} – ${format(new Date(log.created_at), 'yyyy-MM-dd HH:mm')}`}>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <strong>Action:</strong> {log.action}
                        {log.model && <span className="ml-2 text-xs text-gray-500">({log.model})</span>}
                      </p>
                      {log.input && (
                        <p className="text-sm"><strong>Input:</strong> {log.input}</p>
                      )}
                      {log.output && (
                        <p className="text-sm"><strong>Output:</strong> {log.output}</p>
                      )}
                      {log.tokens_used && (
                        <p className="text-xs text-gray-500">
                          Tokens: {log.tokens_used} | Duration: {log.duration_ms}ms
                        </p>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* INVOICES */}
          {tab === 'Invoices' && (
            <div className="space-y-4">
              {invoices.length === 0 ? (
                <Card title="No Invoices">
                  <p className="text-sm text-gray-600">No invoices found in the database.</p>
                </Card>
              ) : (
                invoices.map((inv) => (
                  <Card key={inv.id} title={`${inv.employer?.name || 'Unknown'} – ${inv.month}`}>
                    <p className="text-sm">Total: ${(inv.total_amount / 100).toFixed(2)}</p>
                    <Badge label={inv.status} color={inv.status === 'paid' ? 'green' : 'yellow'} />
                  </Card>
                ))
              )}
            </div>
          )}

          {/* AUDIT */}
          {tab === 'Audit Logs' && (
            <div className="space-y-4">
              {auditLogs.length === 0 ? (
                <Card title="No Audit Logs">
                  <p className="text-sm text-gray-600">No audit logs found. Actions will appear here once logged.</p>
                </Card>
              ) : (
                auditLogs.map((entry) => (
                  <Card key={entry.id} title={`${entry.user_name || entry.user_email || 'System'} – ${format(new Date(entry.created_at), 'yyyy-MM-dd HH:mm')}`}>
                    <p className="text-sm font-medium">{entry.action}</p>
                    {entry.context && Object.keys(entry.context).length > 0 && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">View Details</summary>
                        <pre className="text-xs mt-1 p-2 bg-gray-100 rounded overflow-x-auto max-h-32">
                          {JSON.stringify(entry.context, null, 2)}
                        </pre>
                      </details>
                    )}
                  </Card>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}