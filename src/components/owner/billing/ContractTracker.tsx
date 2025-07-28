import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Calendar, Users, FileText, TrendingUp } from 'lucide-react'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface ContractData {
  employer_id: string
  contract_start: string
  contract_end: string
  expected_users: number
  minimum_commitment: number
  current_active_users?: number
  usage_percentage?: number
}

export function ContractTracker() {
  const [employers, setEmployers] = useState<any[]>([])
  const [selectedEmployerId, setSelectedEmployerId] = useState<string>('')
  const [contractData, setContractData] = useState<ContractData>({
    employer_id: '',
    contract_start: '',
    contract_end: '',
    expected_users: 0,
    minimum_commitment: 0
  })
  const [saving, setSaving] = useState(false)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    fetchEmployers()
  }, [])

  useEffect(() => {
    if (selectedEmployerId) {
      fetchContractData(selectedEmployerId)
      fetchUsageStats(selectedEmployerId)
    }
  }, [selectedEmployerId])

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

  const fetchContractData = async (employerId: string) => {
    try {
      const { data } = await supabase
        .from('employers')
        .select('settings')
        .eq('id', employerId)
        .single()

      if (data?.settings?.contract) {
        setContractData({
          employer_id: employerId,
          ...data.settings.contract
        })
      } else {
        setContractData({
          employer_id: employerId,
          contract_start: '',
          contract_end: '',
          expected_users: 0,
          minimum_commitment: 0
        })
      }
    } catch (error) {
      console.error('Error fetching contract data:', error)
    }
  }

  const fetchUsageStats = async (employerId: string) => {
    try {
      // Get active users count
      const { data: activeUsers } = await supabase
        .from('employer_patients')
        .select('id')
        .eq('employer_id', employerId)
        .eq('is_active', true)

      // Get this month's visits
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const { data: visits } = await supabase
        .from('appointment_usage')
        .select('id')
        .eq('employer_id', employerId)
        .gte('used_on', startOfMonth.toISOString())

      // Get invoices summary
      const { data: invoices } = await supabase
        .from('employer_invoices')
        .select('total_due, status')
        .eq('employer_id', employerId)
        .order('invoice_month', { ascending: false })
        .limit(3)

      setStats({
        activeUsers: activeUsers?.length || 0,
        monthlyVisits: visits?.length || 0,
        recentInvoices: invoices || [],
        totalRevenue: invoices?.reduce((sum, inv) => sum + (inv.total_due || 0), 0) || 0
      })
    } catch (error) {
      console.error('Error fetching usage stats:', error)
    }
  }

  const handleSave = async () => {
    if (!selectedEmployerId) {
      toast.error('Please select an employer')
      return
    }

    setSaving(true)
    try {
      // Get current settings
      const { data: employer } = await supabase
        .from('employers')
        .select('settings')
        .eq('id', selectedEmployerId)
        .single()

      // Update with contract data
      const updatedSettings = {
        ...(employer?.settings || {}),
        contract: {
          contract_start: contractData.contract_start,
          contract_end: contractData.contract_end,
          expected_users: contractData.expected_users,
          minimum_commitment: contractData.minimum_commitment
        }
      }

      const { error } = await supabase
        .from('employers')
        .update({ settings: updatedSettings })
        .eq('id', selectedEmployerId)

      if (error) throw error
      toast.success('Contract data saved successfully')
      fetchUsageStats(selectedEmployerId)
    } catch (error) {
      console.error('Error saving contract data:', error)
      toast.error('Failed to save contract data')
    } finally {
      setSaving(false)
    }
  }

  const getUsagePercentage = () => {
    if (!stats || !contractData.expected_users) return 0
    return Math.round((stats.activeUsers / contractData.expected_users) * 100)
  }

  const getContractStatus = () => {
    if (!contractData.contract_end) return 'active'
    const endDate = new Date(contractData.contract_end)
    const today = new Date()
    const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysRemaining < 0) return 'expired'
    if (daysRemaining < 30) return 'expiring'
    return 'active'
  }

  return (
    <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-zinc-900 dark:to-zinc-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-emerald-600" />
          Contract Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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

        {selectedEmployerId && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-date">Contract Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={contractData.contract_start}
                  onChange={(e) => setContractData({ ...contractData, contract_start: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-date">Contract End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={contractData.contract_end}
                  onChange={(e) => setContractData({ ...contractData, contract_end: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expected-users">Expected Users</Label>
                <Input
                  id="expected-users"
                  type="number"
                  value={contractData.expected_users || ''}
                  onChange={(e) => setContractData({ ...contractData, expected_users: parseInt(e.target.value) || 0 })}
                  placeholder="100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minimum">Minimum Monthly Commitment ($)</Label>
                <Input
                  id="minimum"
                  type="number"
                  value={contractData.minimum_commitment || ''}
                  onChange={(e) => setContractData({ ...contractData, minimum_commitment: parseFloat(e.target.value) || 0 })}
                  placeholder="5000"
                />
              </div>
            </div>

            {stats && (
              <div className="space-y-4 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-gray-50 dark:bg-zinc-800">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Active Users</p>
                          <p className="text-2xl font-bold">{stats.activeUsers}</p>
                          <p className="text-xs text-muted-foreground">
                            of {contractData.expected_users} expected
                          </p>
                        </div>
                        <Users className="h-8 w-8 text-emerald-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-50 dark:bg-zinc-800">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Contract Status</p>
                          <Badge className={
                            getContractStatus() === 'expired' ? 'bg-red-100 text-red-800' :
                            getContractStatus() === 'expiring' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }>
                            {getContractStatus().toUpperCase()}
                          </Badge>
                          {contractData.contract_end && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Ends {format(new Date(contractData.contract_end), 'MMM d, yyyy')}
                            </p>
                          )}
                        </div>
                        <Calendar className="h-8 w-8 text-emerald-600" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-50 dark:bg-zinc-800">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">This Month</p>
                          <p className="text-2xl font-bold">{stats.monthlyVisits}</p>
                          <p className="text-xs text-muted-foreground">visits</p>
                        </div>
                        <TrendingUp className="h-8 w-8 text-emerald-600" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-emerald-50 dark:bg-emerald-900/20">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">User Adoption</span>
                        <span className="text-sm font-bold">{getUsagePercentage()}%</span>
                      </div>
                      <Progress value={getUsagePercentage()} className="h-2" />
                      <p className="text-xs text-muted-foreground">
                        {stats.activeUsers} of {contractData.expected_users} expected users are active
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="w-full"
            >
              {saving ? 'Saving...' : 'Update Contract Data'}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}