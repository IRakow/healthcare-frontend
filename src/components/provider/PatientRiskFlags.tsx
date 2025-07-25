import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useBranding } from '@/hooks/useBranding';
import { AlertCircle, TrendingUp, Clock, Pill } from 'lucide-react';

interface RiskFlag {
  id: string;
  patient_id: string;
  reason: string;
  severity: 'low' | 'medium' | 'high';
  flagged_by: string;
  created_at: string;
  resolved: boolean;
  patient?: {
    full_name: string;
  };
}

export default function PatientRiskFlags() {
  const [riskFlags, setRiskFlags] = useState<RiskFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const branding = useBranding();
  const accentColor = branding?.primary_color || '#3B82F6';

  useEffect(() => {
    loadRiskFlags();
  }, []);

  async function loadRiskFlags() {
    try {
      const { data } = await supabase
        .from('patient_risk_flags')
        .select(`
          *,
          patient:patient_id(full_name)
        `)
        .eq('resolved', false)
        .order('created_at', { ascending: false });

      setRiskFlags(data || []);
    } catch (error) {
      console.error('Error loading risk flags:', error);
    } finally {
      setLoading(false);
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
      default: return accentColor;
    }
  };

  const getIcon = (reason: string) => {
    if (reason.toLowerCase().includes('bp') || reason.toLowerCase().includes('blood pressure')) {
      return TrendingUp;
    }
    if (reason.toLowerCase().includes('appointment')) {
      return Clock;
    }
    if (reason.toLowerCase().includes('medication')) {
      return Pill;
    }
    return AlertCircle;
  };

  if (loading) {
    return <div className="text-center py-4">Loading risk flags...</div>;
  }

  if (riskFlags.length === 0) {
    return (
      <div 
        style={{ borderColor: accentColor }} 
        className="rounded-lg border p-4 text-center text-gray-500"
      >
        No active risk flags
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {riskFlags.map((flag) => {
        const Icon = getIcon(flag.reason);
        const severityColor = getSeverityColor(flag.severity);
        
        return (
          <div
            key={flag.id}
            style={{ borderColor: accentColor }}
            className="rounded-lg border p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div 
                  style={{ backgroundColor: severityColor + '20', color: severityColor }}
                  className="p-2 rounded-lg"
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {flag.patient?.full_name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{flag.reason}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Flagged {new Date(flag.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div 
                style={{ 
                  backgroundColor: severityColor + '20', 
                  color: severityColor,
                  borderColor: severityColor 
                }}
                className="px-3 py-1 rounded-full text-sm font-medium border"
              >
                {flag.severity}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}