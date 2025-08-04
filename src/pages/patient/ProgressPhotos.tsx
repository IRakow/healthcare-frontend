// src/pages/patient/ProgressPhotos.tsx

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { UploadCloudIcon, EyeIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const mockPhotos = [
  { date: '2025-07-01', url: '/uploads/photo1.jpg' },
  { date: '2025-07-15', url: '/uploads/photo2.jpg' },
  { date: '2025-08-01', url: '/uploads/photo3.jpg' }
];

export default function ProgressPhotos() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="min-h-screen px-6 py-20 bg-gradient-to-br from-white via-purple-50 to-indigo-100">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold text-indigo-700 text-center mb-4"
      >
        📸 Progress Photos
      </motion.h1>
      <p className="text-center text-gray-600 mb-10 max-w-xl mx-auto">
        Upload and view your transformation journey. Rachel can help highlight your visual progress over time.
      </p>

      <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {mockPhotos.map(({ date, url }) => (
          <motion.div
            key={url}
            whileHover={{ scale: 1.03 }}
            className="relative cursor-pointer"
            onClick={() => setSelected(url)}
          >
            <Card className="overflow-hidden shadow-lg border border-purple-100">
              <img src={url} alt={date} className="w-full h-60 object-cover" />
              <CardContent className="p-2 text-center text-sm text-purple-800">{date}</CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 max-w-md mx-auto text-center space-y-4">
        <label className="block text-sm font-medium text-gray-700">Upload a new photo</label>
        <Input type="file" className="bg-white border border-gray-300 rounded-md" />
        <Button className="bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-2 mx-auto">
          <UploadCloudIcon className="w-4 h-4" /> Upload Photo
        </Button>
      </div>

      {selected && (
        <motion.div
          key={selected}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setSelected(null)}
        >
          <div className="max-w-2xl w-full bg-white rounded-xl overflow-hidden shadow-xl">
            <img src={selected} className="w-full h-auto" alt="Full photo" />
            <div className="text-right p-4">
              <Button onClick={() => setSelected(null)} variant="ghost" className="text-sm text-gray-600">
                Close
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}