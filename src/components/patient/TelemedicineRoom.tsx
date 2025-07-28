// File: src/components/patient/TelemedicineRoom.tsx

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Video, PhoneOff } from 'lucide-react';

export const TelemedicineRoom: React.FC = () => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initVideo = async () => {
      try {
        const media = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(media);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = media;
        }
      } catch (err) {
        console.error('Error accessing media devices', err);
        setError('Could not access your camera and microphone. Please check your permissions.');
      }
    };

    initVideo();
    return () => {
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl border border-gray-200 bg-white/70 backdrop-blur p-4 shadow"
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Live Telemedicine Room</h3>

      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : (
        <div className="relative">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-[400px] rounded-xl object-cover border"
          />
          <div className="absolute bottom-3 left-3 flex items-center gap-3">
            <button
              className="p-2 bg-red-600 text-white rounded-full shadow hover:bg-red-700"
              onClick={() => {
                stream?.getTracks().forEach((t) => t.stop());
                window.location.href = '/patient';
              }}
            >
              <PhoneOff className="w-5 h-5" />
            </button>
            <div className="p-2 bg-white/80 backdrop-blur rounded-full">
              <Video className="w-5 h-5 text-primary" />
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};