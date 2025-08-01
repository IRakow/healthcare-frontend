'use client'
import { Dialog } from '@headlessui/react'
import { Document, Page } from 'react-pdf'
import { useState } from 'react'

export function PdfModal({ url, open, setOpen }: { url: string; open: boolean; setOpen: (v: boolean) => void }) {
  return (
    <Dialog open={open} onClose={() => setOpen(false)} className="relative z-50">
      <div className="fixed inset-0 bg-black/50" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center">
        <Dialog.Panel className="w-[90vw] h-[90vh] bg-white rounded-xl p-4 shadow-xl overflow-auto">
          <Document file={url}>
            <Page pageNumber={1} width={800} />
          </Document>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}