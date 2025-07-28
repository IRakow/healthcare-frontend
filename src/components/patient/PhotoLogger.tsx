// File: src/components/patient/PhotoLogger.tsx

import React, { useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { CameraIcon, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface PhotoLoggerProps {
  userId: string;
}

export const PhotoLogger: React.FC<PhotoLoggerProps> = ({ userId }) => {
  const supabase = useSupabaseClient();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `meal-photos/${fileName}`;

    setLoading(true);
    setPreview(URL.createObjectURL(file));

    const { error } = await supabase.storage.from('uploads').upload(filePath, file);
    if (error) {
      console.error('Upload failed:', error.message);
    } else {
      console.log('Photo uploaded to Supabase:', filePath);
      // TODO: Optionally trigger AI food analysis here
    }
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-gray-200 bg-white/70 backdrop-blur p-4 shadow"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Log a Meal Photo</h3>
      <div className="space-y-2">
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="block w-full text-sm file:text-white file:bg-primary file:rounded-md file:px-4 file:py-2"
        />
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="animate-spin w-4 h-4" /> Uploading photo...
          </div>
        )}
        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="mt-3 max-h-40 w-auto rounded-xl border"
          />
        )}
      </div>
    </motion.div>
  );
};