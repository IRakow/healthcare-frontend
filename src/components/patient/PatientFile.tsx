import { useEffect } from 'react';
import { usePatientAccess } from '@/hooks/usePatientAccess';
import { auditService } from '@/services/auditService';
import { TimelineViewer } from '@/components/patient/TimelineView';

export default function PatientFile({ patientId }: { patientId: string }) {
  const { isAllowed, loading } = usePatientAccess(patientId);

  useEffect(() => {
    if (isAllowed) {
      (async () => {
        // Log the access
        await auditService.logPatientView(patientId, 'Timeline');
      })();
    }
  }, [patientId, isAllowed]);

  if (loading) {
    return <div className="p-6 text-center">Loading...</div>;
  }

  if (!isAllowed) {
    return (
      <div className="p-6 max-w-md mx-auto text-center">
        <div className="text-6xl mb-4">🚫</div>
        <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
        <p className="text-gray-600 mt-2">You don't have permission to view this patient's information.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Patient File</h1>
      <TimelineViewer patientId={patientId} />
    </div>
  );
}