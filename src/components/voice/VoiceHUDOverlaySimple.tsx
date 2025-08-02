import { motion, AnimatePresence } from 'framer-motion'

export default function VoiceHUDOverlay({ active = true, interim }: { active?: boolean; interim?: string }) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-xl px-4 py-3 bg-white border shadow-lg rounded-full flex items-center gap-3"
        >
          <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm text-slate-800">
            {interim ? `Rachel: "${interim}…"` : 'Rachel is listening...'}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}