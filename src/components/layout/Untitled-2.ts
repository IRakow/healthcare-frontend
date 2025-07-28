// File: src/pages/provider/video.tsx

import React from 'react';
import Head from 'next/head';
import { ProviderLayout } from '@/layouts/ProviderLayout';
import { ProviderCameraPanel } from '@/components/provider/ProviderCameraPanel';
import { motion } from 'framer-motion';

export default function ProviderVideoVisitPage() {
  return (
    <ProviderLayout>
      <Head>
        <title>Telehealth Session</title>
      </Head>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-6xl mx-auto p-6 space-y-6"
      >
        <h1 className="text-2xl font-bold text-gray-900">Telehealth Session</h1>
        <ProviderCameraPanel />
      </motion.div>
    </ProviderLayout>
  );
}