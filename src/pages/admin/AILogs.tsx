import AILogsViewer from '@/components/admin/AILogsViewer';
import { RoleGuard } from '@/components/auth/RoleGuard';

export default function AILogsPage() {
  return (
    <RoleGuard roles={['admin', 'owner']}>
      <div className="p-6 max-w-7xl mx-auto">
        <AILogsViewer />
      </div>
    </RoleGuard>
  );
}