import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Eye, X, Calendar, TrendingUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useUser } from '@/hooks/useUser';
import { supabase } from '@/lib/supabase';

interface ProgressPhoto {
  id: string;
  url: string;
  week: string;
  date: string;
  weight?: number;
  notes?: string;
  created_at: string;
}

export const ProgressPhotoTracker: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { userId } = useUser();
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<ProgressPhoto | null>(null);
  const [currentWeight, setCurrentWeight] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (userId) {
      fetchPhotos();
    }
  }, [userId]);

  const fetchPhotos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('progress_photos')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPhotos(data || []);
    } catch (error) {
      console.error('Failed to fetch progress photos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    setUploading(true);
    try {
      // Upload to Supabase Storage
      const fileName = `${userId}/${Date.now()}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('progress-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('progress-photos')
        .getPublicUrl(fileName);

      // Save metadata to database
      const weekId = `Week ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      const { data: photoData, error: dbError } = await supabase
        .from('progress_photos')
        .insert({
          user_id: userId,
          url: publicUrl,
          week: weekId,
          date: new Date().toISOString(),
          weight: currentWeight ? parseFloat(currentWeight) : null,
          notes: notes || null
        })
        .select()
        .single();

      if (dbError) throw dbError;

      setPhotos([photoData, ...photos]);
      setCurrentWeight('');
      setNotes('');
      
      // Reset file input
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    } catch (error) {
      console.error('Failed to upload photo:', error);
      alert('Failed to upload photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const deletePhoto = async (photoId: string) => {
    if (!confirm('Are you sure you want to delete this progress photo?')) return;

    try {
      const photo = photos.find(p => p.id === photoId);
      if (!photo) return;

      // Extract file path from URL
      const urlParts = photo.url.split('/');
      const filePath = `${userId}/${urlParts[urlParts.length - 1]}`;

      // Delete from storage
      await supabase.storage
        .from('progress-photos')
        .remove([filePath]);

      // Delete from database
      const { error } = await supabase
        .from('progress_photos')
        .delete()
        .eq('id', photoId);

      if (error) throw error;

      setPhotos(photos.filter(p => p.id !== photoId));
      setSelectedPhoto(null);
    } catch (error) {
      console.error('Failed to delete photo:', error);
      alert('Failed to delete photo. Please try again.');
    }
  };

  const getProgressStats = () => {
    const weights = photos
      .filter(p => p.weight)
      .map(p => p.weight as number);
    
    if (weights.length < 2) return null;

    const startWeight = weights[weights.length - 1];
    const currentWeight = weights[0];
    const change = currentWeight - startWeight;
    const percentChange = ((change / startWeight) * 100).toFixed(1);

    return {
      startWeight,
      currentWeight,
      change,
      percentChange
    };
  };

  const stats = getProgressStats();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-gray-200 bg-white/80 backdrop-blur p-6 shadow space-y-6"
    >
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Eye className="w-5 h-5 text-primary" /> Progress Photos
        </h3>
        <label htmlFor="photo-upload" className="cursor-pointer">
          <Button variant="outline" size="sm" disabled={uploading}>
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Photo
              </>
            )}
          </Button>
        </label>
        <input
          type="file"
          accept="image/*"
          ref={inputRef}
          id="photo-upload"
          onChange={handleUpload}
          className="hidden"
        />
      </div>

      {/* Progress Stats */}
      {stats && (
        <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Weight Progress</p>
              <p className="text-2xl font-bold">
                {stats.change > 0 ? '+' : ''}{stats.change.toFixed(1)} lbs
              </p>
              <p className="text-sm text-muted-foreground">
                {stats.percentChange}% change
              </p>
            </div>
            <TrendingUp className={`w-8 h-8 ${stats.change < 0 ? 'text-green-600' : 'text-orange-600'}`} />
          </div>
        </Card>
      )}

      {/* Weight/Notes Input */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Current Weight (optional)</label>
          <input
            type="number"
            value={currentWeight}
            onChange={(e) => setCurrentWeight(e.target.value)}
            placeholder="Enter weight in lbs"
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Notes (optional)</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., Feeling stronger!"
            className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
          <p className="text-sm text-muted-foreground mt-2">Loading photos...</p>
        </div>
      ) : photos.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          No progress photos uploaded yet. Start tracking your journey!
        </p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <motion.div
              key={photo.id}
              whileHover={{ scale: 1.02 }}
              className="relative group cursor-pointer"
              onClick={() => setSelectedPhoto(photo)}
            >
              <img
                src={photo.url}
                alt={`Progress ${photo.week}`}
                className="w-full aspect-square object-cover rounded-lg border shadow"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div className="mt-2 space-y-1">
                <p className="text-xs font-medium text-gray-700">{photo.week}</p>
                {photo.weight && (
                  <p className="text-xs text-muted-foreground">{photo.weight} lbs</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Photo Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-3xl w-full p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{selectedPhoto.week}</h3>
                <p className="text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  {new Date(selectedPhoto.date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deletePhoto(selectedPhoto.id)}
                >
                  Delete
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedPhoto(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <img
              src={selectedPhoto.url}
              alt={`Progress ${selectedPhoto.week}`}
              className="w-full rounded-lg"
            />
            
            {(selectedPhoto.weight || selectedPhoto.notes) && (
              <div className="space-y-2">
                {selectedPhoto.weight && (
                  <p className="text-sm">
                    <span className="font-medium">Weight:</span> {selectedPhoto.weight} lbs
                  </p>
                )}
                {selectedPhoto.notes && (
                  <p className="text-sm">
                    <span className="font-medium">Notes:</span> {selectedPhoto.notes}
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};