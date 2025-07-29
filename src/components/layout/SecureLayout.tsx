import React from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'

export const SecureLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Helmet>
        <title>Insperity Health AI</title>
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="min-h-screen bg-gradient-to-br from-white via-sky-100 to-blue-200 px-4 py-8 md:px-10"
      >
        <div className="max-w-7xl mx-auto w-full">
          <div className="relative overflow-hidden border border-white/30 rounded-3xl backdrop-blur-2xl shadow-2xl bg-white/70 p-6 md:p-10 transition-all duration-300 ease-in-out hover:shadow-blue-200">
            {/* Pulse Accent Orb (top right) */}
            <div className="absolute top-4 right-6 w-4 h-4 bg-sky-400 rounded-full animate-ping opacity-60" />

            {/* Subtle Frame Glow */}
            <div className="absolute inset-0 rounded-3xl border border-white/10 pointer-events-none" />

            {/* Content */}
            <div className="relative z-10">{children}</div>
          </div>
        </div>
      </motion.div>
    </>
  )
}
