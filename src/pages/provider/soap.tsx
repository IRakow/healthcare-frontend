// File: src/pages/provider/soap.tsx

import React from 'react';
import Head from 'next/head';
import { ProviderLayout } from '@/layouts/ProviderLayout';
import { SOAPSummaryViewer } from '@/components/provider/SOAPSummaryViewer';
import { motion } from 'framer-motion';

const ProviderSOAPPage: React.FC = () => {
  return (
    <ProviderLayout>
      <Head>
        <title>SOAP Notes</title>
      </Head>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto p-6 space-y-8"
        aria-label="SOAP Note Viewer"
      >
        <h1 className="text-2xl font-bold text-gray-900">SOAP Notes</h1>
        <SOAPSummaryViewer />
      </motion.div>
    </ProviderLayout>
  );
};

export default ProviderSOAPPage;
