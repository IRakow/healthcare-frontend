import { ReactNode, useEffect, useState } from 'react'
import AdminSidebar from '@/components/admin/AdminSidebar'
import { useAdminVoiceCapture } from '@/lib/voice/useAdminVoiceCapture'
import VoiceHUDOverlay from '@/components/voice/VoiceHUDOverlaySimple'
import { Menu, X } from 'lucide-react'

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { startListening, interimText } = useAdminVoiceCapture()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    startListening()
  }, [])

  return (
    <div className="relative min-h-screen flex bg-gradient-to-br from-white via-sky-50 to-emerald-50">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg"
      >
        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Sidebar - Desktop */}
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      {/* Sidebar - Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="absolute left-0 top-0 h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <AdminSidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 w-full overflow-x-hidden">
        <div className="rounded-2xl lg:rounded-3xl bg-white/60 backdrop-blur shadow-xl p-4 sm:p-6 md:p-8 lg:p-10 mt-14 lg:mt-0">
          {children}
        </div>
      </main>

      {/* Floating AI Assistant - Commented out to remove legacy AI bar */}
      {/* <div className="fixed bottom-4 right-4 z-50">
        <AssistantBar />
      </div> */}
      
      {/* Rachel Voice HUD */}
      <VoiceHUDOverlay interim={interimText} />
    </div>
  )
}