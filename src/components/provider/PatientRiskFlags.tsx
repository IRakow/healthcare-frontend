import React, { useEffect, useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

interface RiskFlag {
  id: string;
  patient_name: string;
  flag_type: string;
  message: string;
  flagged_at: string;
}

export const PatientRiskFlags: React.FC = () => {
  const supabase = useSupabaseClient();
  const [flags, setFlags] = useState<RiskFlag[]>([]);

  useEffect(() => {
    const fetchFlags = async () => {
      const { data, error } = await supabase
        .from('risk_flags')
        .select('id, patient_name, flag_type, message, flagged_at')
        .order('flagged_at', { ascending: false });

      if (error) {
        console.error('[PatientRiskFlags] Supabase error:', error);
        return;
      }

      setFlags(data);
    };

    fetchFlags();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-gray-200 bg-white/70 backdrop-blur p-6 shadow"
    >
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Patient Risk Flags</h2>
      {flags.length === 0 ? (
        <p className="text-muted-foreground text-sm">No current risk flags.</p>
      ) : (
        <ul className="space-y-4">
          {flags.map((flag) => (
            <li key={flag.id} className="p-4 bg-white rounded-xl shadow border">
              <div className="flex items-center gap-3">
                <AlertCircle className="text-red-500 w-5 h-5" />
                <div>
                  <p className="text-sm font-medium text-gray-800">{flag.patient_name}</p>
                  <p className="text-xs text-muted-foreground">
                    <strong>{flag.flag_type}:</strong> {flag.message}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">{new Date(flag.flagged_at).toLocaleString()}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
};