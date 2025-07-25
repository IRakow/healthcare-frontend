import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { MeditationLog, MeditationType } from '@/types/meditation';

export function useMeditationLogs() {
  const [logs, setLogs] = useState<MeditationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMinutes: 0,
    totalSessions: 0,
    averageDuration: 0,
    favoriteType: null as MeditationType | null,
  });

  useEffect(() => {
    loadLogs();
  }, []);

  async function loadLogs() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('meditation_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setLogs(data);
        calculateStats(data);
      }
    } catch (error) {
      console.error('Error loading meditation logs:', error);
    } finally {
      setLoading(false);
    }
  }

  function calculateStats(logs: MeditationLog[]) {
    if (logs.length === 0) return;

    const totalMinutes = logs.reduce((sum, log) => sum + (log.duration_minutes || 0), 0);
    const averageDuration = Math.round(totalMinutes / logs.length);

    // Find favorite type
    const typeCounts: Record<string, number> = {};
    logs.forEach(log => {
      typeCounts[log.type] = (typeCounts[log.type] || 0) + 1;
    });
    
    const favoriteType = Object.entries(typeCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] as MeditationType;

    setStats({
      totalMinutes,
      totalSessions: logs.length,
      averageDuration,
      favoriteType,
    });
  }

  async function logMeditation(type: MeditationType, duration: number, startTime?: Date) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const start = startTime || new Date(Date.now() - duration * 60000);
      
      const { data, error } = await supabase
        .from('meditation_logs')
        .insert({
          user_id: user.id,
          type,
          duration_minutes: duration,
          started_at: start.toISOString(),
          completed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setLogs([data, ...logs]);
        calculateStats([data, ...logs]);
      }

      return data;
    } catch (error) {
      console.error('Error logging meditation:', error);
      return null;
    }
  }

  return {
    logs,
    stats,
    loading,
    logMeditation,
    refresh: loadLogs,
  };
}