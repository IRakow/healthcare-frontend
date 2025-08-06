import { AdminAiActivityFeed } from '@/components/admin/AdminAiActivityFeed'
import { AdminAiSummaryGenerator } from '@/components/admin/AdminAiSummaryGenerator'
import { AdminCustomReportPanel } from '@/components/admin/AdminCustomReportPanel'
import { AdminPinnedEmployers } from '@/components/admin/AdminPinnedEmployers'
import { AdminTimeline } from '@/components/admin/AdminTimeline'
import { AdminPdfExportPanel } from '@/components/admin/AdminPdfExportPanel'
import { VoiceBrandingSelector } from '@/components/admin/VoiceBrandingSelector'
import { Sparkles, Bot, History, Download } from 'lucide-react'

export default function AdminAiCommandCenter() {
  return (
    <div className="p-6">
      <div className="space-y-10">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-extrabold flex items-center gap-3 text-slate-800">
            <Bot className="w-6 h-6 text-primary" /> AI Command Center
          </h1>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm">
              <Download className="w-4 h-4 mr-1 inline-block" /> Export Full Report
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AdminAiActivityFeed />
          <AdminAiSummaryGenerator />
          <AdminCustomReportPanel />
          <AdminPdfExportPanel />
          <AdminTimeline />
          <VoiceBrandingSelector />
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-semibold text-slate-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500" /> Strategic Focus
          </h2>
          <p className="text-sm text-muted-foreground mb-3">Your pinned employers are prioritized for AI personalization and retention tools.</p>
          <AdminPinnedEmployers />
        </div>
      </div>
    </div>
  )
}