import { Card, CardContent } from '@/components/ui/card'

const invoices = [
  { employer: 'Techfinity', month: 'July 2025', amount: 22850, link: '/pdf/invoices/techfinity-july.pdf' },
  { employer: 'NovaHealth', month: 'July 2025', amount: 18600, link: '/pdf/invoices/novahealth-july.pdf' },
]

export function EmployerInvoiceViewer() {
  return (
    <Card className="glass-card mt-6">
      <CardContent>
        <h2 className="text-lg font-bold text-slate-800 mb-4">Employer Invoices</h2>
        <ul className="space-y-4">
          {invoices.map((inv, i) => (
            <li key={i} className="flex items-center justify-between border-b pb-2 border-slate-200">
              <div>
                <p className="text-sm font-semibold">{inv.employer}</p>
                <p className="text-xs text-slate-500">{inv.month}</p>
              </div>
              <div className="text-right">
                <p className="text-sky-700 font-bold">${inv.amount.toLocaleString()}</p>
                <a
                  href={inv.link}
                  className="text-sm text-blue-600 underline hover:text-blue-800"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View PDF
                </a>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}