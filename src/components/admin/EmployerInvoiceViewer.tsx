import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { PdfModal } from '@/components/ui/PdfModal'

const invoices = [
  { employer: 'Techfinity', month: 'July 2025', amount: 22850, link: '/pdf/invoices/techfinity-july.pdf' },
  { employer: 'NovaHealth', month: 'July 2025', amount: 18600, link: '/pdf/invoices/novahealth-july.pdf' }
]

export function EmployerInvoiceViewer() {
  const [open, setOpen] = useState(false)
  const [currentPdf, setCurrentPdf] = useState<string | null>(null)

  const openPreview = (url: string) => {
    setCurrentPdf(url)
    setOpen(true)
  }

  return (
    <Card className="glass-card">
      <CardContent>
        <h2 className="text-lg font-bold text-slate-800 mb-4">🧾 Invoices</h2>
        <ul className="space-y-4">
          {invoices.map((inv, i) => (
            <li key={i} className="flex justify-between items-center border-b pb-2">
              <div>
                <p className="font-semibold">{inv.employer}</p>
                <p className="text-xs text-slate-500">{inv.month}</p>
              </div>
              <button
                onClick={() => openPreview(inv.link)}
                className="text-sm text-blue-600 underline hover:text-blue-800"
              >
                Preview PDF
              </button>
            </li>
          ))}
        </ul>
      </CardContent>

      {open && currentPdf && <PdfModal url={currentPdf} open={open} setOpen={setOpen} />}
    </Card>
  )
}