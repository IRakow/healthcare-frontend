import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { Building2, FileText, Users, Calendar, Download, Mail, Eye } from 'lucide-react'
import { format } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'

interface EmployerInvoice {
  invoice_id: string
  invoice_number: string
  issue_date: string
  due_date: string
  status: string
  total_amount: number
  employer_id: string
  employer_name: string
  contact_email: string
  patient_count: string
  period_start: string
  period_end: string
}

interface PatientBreakdown {
  patient_id: string
  patient_name: string
  employee_id: string
  department: string
  appointment_count: number
  amount: number
  appointments: any[]
}

export default function EmployerInvoiceViewer() {
  const [invoices, setInvoices] = useState<EmployerInvoice[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedInvoice, setSelectedInvoice] = useState<EmployerInvoice | null>(null)
  const [patientBreakdown, setPatientBreakdown] = useState<PatientBreakdown[]>([])
  const [loadingBreakdown, setLoadingBreakdown] = useState(false)

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from('employer_invoice_details')
        .select('*')
        .order('issue_date', { ascending: false })
        .limit(50)

      if (error) throw error
      
      // Group by invoice to avoid duplicates from the view
      const uniqueInvoices = data?.reduce((acc: EmployerInvoice[], curr: any) => {
        if (!acc.find(inv => inv.invoice_id === curr.invoice_id)) {
          acc.push(curr)
        }
        return acc
      }, []) || []
      
      setInvoices(uniqueInvoices)
    } catch (error) {
      console.error('Error fetching invoices:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPatientBreakdown = async (invoiceId: string) => {
    setLoadingBreakdown(true)
    try {
      const { data, error } = await supabase
        .from('employer_invoice_patient_breakdown')
        .select('*')
        .eq('invoice_id', invoiceId)

      if (error) throw error
      setPatientBreakdown(data || [])
    } catch (error) {
      console.error('Error fetching patient breakdown:', error)
    } finally {
      setLoadingBreakdown(false)
    }
  }

  const handleViewDetails = async (invoice: EmployerInvoice) => {
    setSelectedInvoice(invoice)
    await fetchPatientBreakdown(invoice.invoice_id)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'overdue':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Employer Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Employer Invoices
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employer</TableHead>
                <TableHead>Invoice #</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Patients</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.invoice_id}>
                  <TableCell className="font-medium">
                    <div>
                      <p>{invoice.employer_name}</p>
                      <p className="text-xs text-muted-foreground">{invoice.contact_email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {invoice.invoice_number}
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      {format(new Date(invoice.period_start), 'MMM d')} - 
                      {format(new Date(invoice.period_end), 'MMM d, yyyy')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      {invoice.patient_count}
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(invoice.total_amount)}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(invoice.status)}>
                      {invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetails(invoice)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Mail className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice Details - {selectedInvoice?.invoice_number}</DialogTitle>
            <DialogDescription>
              {selectedInvoice?.employer_name} • {selectedInvoice?.patient_count} patients
            </DialogDescription>
          </DialogHeader>

          {loadingBreakdown ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Issue Date</p>
                  <p className="font-medium">
                    {selectedInvoice && format(new Date(selectedInvoice.issue_date), 'MMM d, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Due Date</p>
                  <p className="font-medium">
                    {selectedInvoice && format(new Date(selectedInvoice.due_date), 'MMM d, yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Billing Period</p>
                  <p className="font-medium">
                    {selectedInvoice && (
                      <>
                        {format(new Date(selectedInvoice.period_start), 'MMM d')} - 
                        {format(new Date(selectedInvoice.period_end), 'MMM d, yyyy')}
                      </>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="font-semibold text-lg">
                    {selectedInvoice && formatCurrency(selectedInvoice.total_amount)}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Patient Breakdown</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Employee ID</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Appointments</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patientBreakdown.map((patient) => (
                      <TableRow key={patient.patient_id}>
                        <TableCell className="font-medium">
                          {patient.patient_name}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {patient.employee_id || '-'}
                        </TableCell>
                        <TableCell>{patient.department || '-'}</TableCell>
                        <TableCell>{patient.appointment_count}</TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatCurrency(patient.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}