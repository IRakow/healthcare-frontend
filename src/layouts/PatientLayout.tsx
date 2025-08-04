// src/layouts/PatientLayout.tsx

import { ReactNode } from 'react';
import AssistantBar from '@/components/assistant/AssistantBar';
import { useLocation } from 'react-router-dom';

export default function PatientLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isPatientRoute = location.pathname?.startsWith('/patient');

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header / Sidebar would go here */}

      <main className="pb-24">{/* Extra space for AssistantBar */}
        {children}
      </main>

      {isPatientRoute && <AssistantBar />}
    </div>
  );
}