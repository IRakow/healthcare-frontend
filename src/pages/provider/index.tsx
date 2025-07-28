import { ProviderDashboard } from '@/components/provider/ProviderDashboard';
import ProviderLayout from '@/components/layout/ProviderLayout';

export default function ProviderPage() {
  return (
    <ProviderLayout>
      <ProviderDashboard />
    </ProviderLayout>
  );
}