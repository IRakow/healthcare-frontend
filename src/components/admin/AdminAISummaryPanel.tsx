// src/components/admin/AdminAISummaryPanel.tsx

import AdminAiSummaryGenerator from '@/components/admin/AdminAiSummaryGenerator';

export default function AdminAISummaryPanel() {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-bold mb-4">AI Summary Insights</h2>
      <AdminAiSummaryGenerator />
    </div>
  );
}