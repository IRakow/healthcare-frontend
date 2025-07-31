import { Card, CardContent } from '@/components/ui/card'

export function MonthlyInvoicePanel() {
  const handleGenerate = () => {
    alert('🔄 Monthly invoices queued for generation.')
  }

  return (
    <Card className="glass-card mt-6">
      <CardContent>
        <h2 className="text-lg font-bold text-slate-800 mb-4">Monthly Invoice Control</h2>
        <button
          onClick={handleGenerate}
          className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-xl shadow"
        >
          Generate Now
        </button>
        <p className="mt-4 text-sm text-slate-600">
          Last generated: <strong>July 31, 2025</strong> at 4:12 PM
        </p>
      </CardContent>
    </Card>
  )
}