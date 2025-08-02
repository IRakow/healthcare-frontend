// File: src/pages/LoginPortalSelector.tsx

import { useNavigate } from 'react-router-dom';
import { useBrandingContext } from '@/contexts/BrandingProvider';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Building2, User, ShieldCheck } from 'lucide-react';
import AnimatedLogoWithSound from '@/components/branding/AnimatedLogoWithSound';

export default function LoginPortalSelector() {
  const navigate = useNavigate();
  const { branding } = useBrandingContext();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-50 to-cyan-100 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white/60 backdrop-blur-xl border border-white/30 shadow-2xl rounded-3xl max-w-2xl w-full p-8"
      >
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <AnimatedLogoWithSound />
          </div>
          {branding.logo_url ? (
            <img src={branding.logo_url} alt="Logo" className="h-10 mx-auto mb-2" />
          ) : (
            <h1 className="text-2xl font-bold text-[color:var(--brand-primary)]">Insperity Health</h1>
          )}
          <p className="text-gray-600 text-sm">
            Welcome to your AI-powered healthcare platform
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <Button
            onClick={() => navigate('/admin/dashboard')}
            className="flex flex-col items-center gap-2 bg-sky-600 text-white py-6 rounded-xl shadow hover:bg-sky-700"
          >
            <ShieldCheck className="w-6 h-6" />
            <span className="text-sm font-medium">Admin Portal</span>
          </Button>

          <Button
            onClick={() => navigate('/provider/dashboard')}
            className="flex flex-col items-center gap-2 bg-emerald-600 text-white py-6 rounded-xl shadow hover:bg-emerald-700"
          >
            <Building2 className="w-6 h-6" />
            <span className="text-sm font-medium">Provider Portal</span>
          </Button>

          <Button
            onClick={() => navigate('/patient/dashboard')}
            className="flex flex-col items-center gap-2 bg-indigo-600 text-white py-6 rounded-xl shadow hover:bg-indigo-700"
          >
            <User className="w-6 h-6" />
            <span className="text-sm font-medium">Patient Portal</span>
          </Button>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          Powered by AI • {branding.employer_name || 'Insperity Health'}
        </p>
      </motion.div>
    </div>
  );
}