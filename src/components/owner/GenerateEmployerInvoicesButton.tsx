import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { FileText, Building2, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface InvoiceResult {
  employer_id: string
  employer_name: string
  invoice_id: string
  total_amount: number
  patient_count: number
}

export default function GenerateEmployerInvoicesButton() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [results, setResults] = useState<InvoiceResult[]>([])
  const [showResults, setShowResults] = useState(false)

  const generateInvoices = async () => {
    setIsGenerating(true)
    setResults([])

    try {
      // Call the generate_monthly_employer_invoices function
      const { data, error } = await supabase
        .rpc('generate_monthly_employer_invoices')

      if (error) throw error

      if (data && data.length > 0) {
        setResults(data)
        setShowResults(true)
        toast.success(`Generated ${data.length} employer invoices`)
      } else {
        toast.info('No pending charges to invoice for last month')
      }
    } catch (error) {
      console.error('Error generating invoices:', error)
      toast.error('Failed to generate invoices')
    } finally {
      setIsGenerating(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  return (
    <>
      <Button
        onClick={generateInvoices}
        disabled={isGenerating}
        className="bg-emerald-600 hover:bg-emerald-700"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating Invoices...
          </>
        ) : (
          <>
            <Building2 className="mr-2 h-4 w-4" />
            Generate Employer Invoices
          </>
        )}
      </Button>

      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Invoice Generation Results</DialogTitle>
            <DialogDescription>
              Successfully generated {results.length} employer invoices for last month
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {results.map((result) => (
              <Card key={result.invoice_id} className="border-emerald-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-emerald-600" />
                        <h4 className="font-semibold">{result.employer_name}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Invoice ID: {result.invoice_id.slice(0, 8)}...
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {result.patient_count} patients
                        </Badge>
                        <span className="text-sm font-medium">
                          {formatCurrency(result.total_amount)}
                        </span>
                      </div>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Total Amount: {formatCurrency(results.reduce((sum, r) => sum + r.total_amount, 0))}
            </div>
            <Button onClick={() => setShowResults(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}