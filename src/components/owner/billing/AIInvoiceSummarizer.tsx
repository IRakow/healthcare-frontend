import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { FileText, Loader2, TrendingUp, Users, DollarSign } from 'lucide-react'
import { format } from 'date-fns'

interface InvoiceSummary {
  employer_name: string
  invoice_month: string
  total_employees: number
  total_family_members: number
  total_visits: number
  included_visits: number
  billable_visits: number
  base_charges: number
  visit_charges: number
  total_due: number
  ai_summary?: string
}

export function AIInvoiceSummarizer() {
  const [employers, setEmployers] = useState<any[]>([])
  const [selectedEmployerId, setSelectedEmployerId] = useState<string>('')
  const [selectedMonth, setSelectedMonth] = useState<string>('')
  const [summarizing, setSummarizing] = useState(false)
  const [summary, setSummary] = useState<InvoiceSummary | null>(null)

  useEffect(() => {
    fetchEmployers()
    // Set default month to last month
    const lastMonth = new Date()
    lastMonth.setMonth(lastMonth.getMonth() - 1)
    setSelectedMonth(format(lastMonth, 'yyyy-MM'))
  }, [])

  const fetchEmployers = async () => {
    try {
      const { data, error } = await supabase
        .from('employers')
        .select('id, name')
        .eq('is_active', true)
        .order('name')

      if (!error && data) {
        setEmployers(data)
      }
    } catch (error) {
      console.error('Error fetching employers:', error)
    }
  }

  const generateSummary = async () => {
    if (!selectedEmployerId || !selectedMonth) {
      toast.error('Please select both employer and month')
      return
    }

    setSummarizing(true)
    try {
      // Fetch invoice data
      const invoiceMonth = new Date(selectedMonth + '-01')
      
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('employer_invoices')
        .select('*')
        .eq('employer_id', selectedEmployerId)
        .eq('invoice_month', invoiceMonth.toISOString().split('T')[0])
        .single()

      if (invoiceError || !invoiceData) {
        // Try to generate the invoice if it doesn't exist
        const { data: generatedInvoice } = await supabase
          .rpc('generate_monthly_employer_invoice', {
            p_employer_id: selectedEmployerId,
            p_invoice_month: invoiceMonth.toISOString().split('T')[0]
          })

        if (!generatedInvoice) {
          toast.error('No invoice data available for this period')
          return
        }

        // Fetch the newly generated invoice
        const { data: newInvoice } = await supabase
          .from('employer_invoices')
          .select('*')
          .eq('id', generatedInvoice)
          .single()

        if (newInvoice) {
          processInvoiceData(newInvoice)
        }
      } else {
        processInvoiceData(invoiceData)
      }
    } catch (error) {
      console.error('Error generating summary:', error)
      toast.error('Failed to generate invoice summary')
    } finally {
      setSummarizing(false)
    }
  }

  const processInvoiceData = async (invoiceData: any) => {
    // Get employer name
    const { data: employer } = await supabase
      .from('employers')
      .select('name')
      .eq('id', selectedEmployerId)
      .single()

    const summary: InvoiceSummary = {
      employer_name: employer?.name || 'Unknown',
      invoice_month: format(new Date(invoiceData.invoice_month), 'MMMM yyyy'),
      total_employees: invoiceData.total_employees || 0,
      total_family_members: invoiceData.total_family_members || 0,
      total_visits: invoiceData.total_visits || 0,
      included_visits: invoiceData.included_visits || 0,
      billable_visits: invoiceData.billable_visits || 0,
      base_charges: invoiceData.base_charges || 0,
      visit_charges: invoiceData.visit_charges || 0,
      total_due: invoiceData.total_due || 0
    }

    // Generate AI summary
    summary.ai_summary = generateAISummary(summary)
    
    setSummary(summary)
  }

  const generateAISummary = (data: InvoiceSummary): string => {
    const totalUsers = data.total_employees + data.total_family_members
    const avgVisitsPerUser = totalUsers > 0 ? (data.total_visits / totalUsers).toFixed(1) : '0'
    const utilizationRate = data.included_visits > 0 
      ? ((data.total_visits / data.included_visits) * 100).toFixed(0) 
      : '0'

    let summary = `In ${data.invoice_month}, ${data.employer_name} had `
    summary += `**${data.total_employees} active employees**`
    
    if (data.total_family_members > 0) {
      summary += ` and **${data.total_family_members} family members**`
    }
    
    summary += `. The total of **${data.total_visits} visits** represents an average of ${avgVisitsPerUser} visits per user. `

    if (data.billable_visits > 0) {
      summary += `After accounting for ${data.included_visits} included visits, `
      summary += `**${data.billable_visits} overage visits** were billed at additional cost. `
    } else {
      summary += `All visits were covered within the ${data.included_visits} included visits. `
    }

    summary += `The total invoice amount is **$${data.total_due.toLocaleString()}**, `
    summary += `consisting of $${data.base_charges.toLocaleString()} in subscription fees`
    
    if (data.visit_charges > 0) {
      summary += ` and $${data.visit_charges.toLocaleString()} in overage charges`
    }
    
    summary += `.`

    // Add insights
    if (parseInt(utilizationRate) > 100) {
      summary += ` 📈 Visit utilization is at ${utilizationRate}%, indicating high engagement.`
    } else if (parseInt(utilizationRate) < 50) {
      summary += ` 📊 Visit utilization is at ${utilizationRate}%, suggesting room for increased adoption.`
    }

    return summary
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  return (
    <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-zinc-900 dark:to-zinc-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-emerald-600" />
          AI Invoice Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="employer">Select Employer</Label>
            <Select value={selectedEmployerId} onValueChange={setSelectedEmployerId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an employer..." />
              </SelectTrigger>
              <SelectContent>
                {employers.map(emp => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="month">Month to Summarize</Label>
            <input
              id="month"
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        <Button 
          onClick={generateSummary} 
          disabled={summarizing || !selectedEmployerId || !selectedMonth}
          className="w-full"
        >
          {summarizing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Summary...
            </>
          ) : (
            'Generate Summary'
          )}
        </Button>

        {summary && (
          <div className="space-y-4">
            <Card className="bg-emerald-50 dark:bg-emerald-900/20">
              <CardContent className="p-4">
                <div 
                  className="text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ 
                    __html: summary.ai_summary?.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') || '' 
                  }}
                />
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gray-50 dark:bg-zinc-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Users</p>
                      <p className="text-2xl font-bold">
                        {summary.total_employees + summary.total_family_members}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {summary.total_employees} employees
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-emerald-600 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-50 dark:bg-zinc-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Visit Activity</p>
                      <p className="text-2xl font-bold">{summary.total_visits}</p>
                      <p className="text-xs text-muted-foreground">
                        {summary.billable_visits} billable
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-emerald-600 opacity-20" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-50 dark:bg-zinc-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Due</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(summary.total_due)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(summary.base_charges)} base
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-emerald-600 opacity-20" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}