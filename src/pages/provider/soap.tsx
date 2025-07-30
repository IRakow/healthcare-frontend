// File: src/pages/provider/soap.tsx

import React from 'react';
import { Helmet } from 'react-helmet-async';
import ProviderLayout from '@/components/layout/ProviderLayout';
import { SOAPSummaryViewer } from '@/components/provider/SOAPSummaryViewer';
import { motion } from 'framer-motion';

const ProviderSOAPPage: React.FC = () => {
  return (
    <ProviderLayout>
      <Helmet>
        <title>SOAP Notes</title>
      </Helmet>
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
