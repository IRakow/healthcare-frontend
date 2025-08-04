// src/layouts/PatientLayout.tsx

import { ReactNode } from 'react';
import AssistantBar from '@/components/assistant/AssistantBar';
import { usePathname } from 'next/navigation';

export default function PatientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isPatientRoute = pathname?.startsWith('/patient');

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