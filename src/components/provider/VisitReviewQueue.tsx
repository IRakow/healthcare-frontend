import React, { useEffect, useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { motion } from 'framer-motion';
import { ClipboardList, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VisitEntry {
  id: string;
  patient_name: string;
  date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
}

export const VisitReviewQueue: React.FC = () => {
  const supabase = useSupabaseClient();
  const [visits, setVisits] = useState<VisitEntry[]>([]);

  useEffect(() => {
    const fetchVisits = async () => {
      const { data, error } = await supabase
        .from('visit_queue')
        .select('id, patient_name, date, reason, status')
        .eq('status', 'pending')
        .order('date', { ascending: true });

      if (error) {
        console.error('[VisitReviewQueue] Supabase error:', error);
        return;
      }

      setVisits(data);
    };

    fetchVisits();
  }, []);

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    const { error } = await supabase
      .from('visit_queue')
      .update({ status })
      .eq('id', id);

    if (!error) setVisits((v) => v.filter((entry) => entry.id !== id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-gray-200 bg-white/70 backdrop-blur p-6 shadow"
    >
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Visit Review Queue</h2>
      {visits.length === 0 ? (
        <p className="text-muted-foreground text-sm">No pending reviews.</p>
      ) : (
        <ul className="space-y-4">
          {visits.map((visit) => (
            <li
              key={visit.id}
              className="bg-white p-4 rounded-xl shadow border flex justify-between items-center"
            >
              <div>
                <p className="text-sm font-medium text-gray-800">{visit.patient_name}</p>
                <p className="text-xs text-muted-foreground">{visit.reason} — {new Date(visit.date).toLocaleString()}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => updateStatus(visit.id, 'approved')}>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => updateStatus(visit.id, 'rejected')}>
                  <XCircle className="w-4 h-4 text-red-600" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
};