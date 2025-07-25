import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Eye, Users, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ViewStats {
  upload_id: string;
  filename: string;
  total_views: number;
  unique_viewers: number;
  last_viewed: string | null;
}

export function UploadViewsTracker({ patientId }: { patientId: string }) {
  const [viewStats, setViewStats] = useState<ViewStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadViewStats();
  }, [patientId]);

  async function loadViewStats() {
    try {
      // Get all uploads for this patient with view counts
      const { data, error } = await supabase
        .from('uploads')
        .select(`
          id,
          filename,
          upload_views (
            viewer_id,
            viewed_at
          )
        `)
        .eq('patient_id', patientId);

      if (error) throw error;

      // Process the data to get view statistics
      const stats: ViewStats[] = (data || []).map(upload => {
        const views = upload.upload_views || [];
        const uniqueViewers = new Set(views.map((v: any) => v.viewer_id));
        const lastView = views.length > 0 
          ? views.sort((a: any, b: any) => 
              new Date(b.viewed_at).getTime() - new Date(a.viewed_at).getTime()
            )[0].viewed_at
          : null;

        return {
          upload_id: upload.id,
          filename: upload.filename,
          total_views: views.length,
          unique_viewers: uniqueViewers.size,
          last_viewed: lastView
        };
      });

      // Sort by most viewed
      stats.sort((a, b) => b.total_views - a.total_views);
      setViewStats(stats);
    } catch (error) {
      console.error('Error loading view stats:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-sm text-gray-500">Loading view statistics...</div>;
  }

  if (viewStats.length === 0) {
    return null;
  }

  const totalViews = viewStats.reduce((sum, stat) => sum + stat.total_views, 0);

  return (
    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Document View Analytics</h3>
        <Badge variant="secondary" className="text-xs">
          <Eye className="h-3 w-3 mr-1" />
          {totalViews} total views
        </Badge>
      </div>

      <div className="space-y-2">
        {viewStats.filter(stat => stat.total_views > 0).map(stat => (
          <div key={stat.upload_id} className="bg-white p-3 rounded border text-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">{stat.filename}</p>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {stat.total_views} views
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {stat.unique_viewers} viewers
                  </span>
                  {stat.last_viewed && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Last: {new Date(stat.last_viewed).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}