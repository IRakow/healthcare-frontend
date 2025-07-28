// File: src/components/patient/UploadPreviewPanel.tsx

import React from 'react';
import { motion } from 'framer-motion';

interface UploadPreviewPanelProps {
  uploads: Array<{
    id: string;
    url: string;
    type: string;
    uploaded_at: string;
  }>;
}

export const UploadPreviewPanel: React.FC<UploadPreviewPanelProps> = ({ uploads }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-gray-200 bg-white/70 backdrop-blur p-4 shadow"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Recent Uploads</h3>
      {uploads.length === 0 ? (
        <p className="text-muted-foreground text-sm">No uploads yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {uploads.map((upload) => (
            <a
              key={upload.id}
              href={upload.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-xl overflow-hidden border bg-white shadow hover:shadow-md transition"
            >
              <img
                src={upload.url}
                alt={upload.type}
                className="h-40 w-full object-cover"
              />
              <div className="p-2">
                <p className="text-xs font-medium text-gray-700">{upload.type}</p>
                <p className="text-[10px] text-muted-foreground">{new Date(upload.uploaded_at).toLocaleString()}</p>
              </div>
            </a>
          ))}
        </div>
      )}
    </motion.div>
  );
};