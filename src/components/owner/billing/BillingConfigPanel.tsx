import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Save, DollarSign, Calendar, Users } from 'lucide-react'

interface BillingConfig {
  employer_id: string
  base_rate_per_employee: number
  base_rate_per_family_member: number
  visit_included_per_user: number
  visit_price: number
  billing_frequency: string
  grace_period_days: number
  max_family_members_per_account: number
  custom_plan_name: string
  custom_notes: string
}

export function BillingConfigPanel() {
  const [employers, setEmployers] = useState<any[]>([])
  const [selectedEmployerId, setSelectedEmployerId] = useState<string>('')
  const [config, setConfig] = useState<Partial<BillingConfig>>({
    base_rate_per_employee: 50,
    base_rate_per_family_member: 25,
    visit_included_per_user: 2,
    visit_price: 75,
    billing_frequency: 'monthly',
    grace_period_days: 30,
    max_family_members_per_account: 5,
    custom_plan_name: '',
    custom_notes: ''
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchEmployers()
  }, [])

  useEffect(() => {
    if (selectedEmployerId) {
      fetchConfig(selectedEmployerId)
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

  const fetchConfig = async (employerId: string) => {
    try {
      const { data, error } = await supabase
        .from('billing_configs')
        .select('*')
        .eq('employer_id', employerId)
        .single()

      if (data) {
        setConfig(data)
      }
    } catch (error) {
      // Config doesn't exist yet, use defaults
      setConfig(prev => ({ ...prev, employer_id: employerId }))
    }
  }

  const handleSave = async () => {
    if (!selectedEmployerId) {
      toast.error('Please select an employer')
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase
        .from('billing_configs')
        .upsert({
          ...config,
          employer_id: selectedEmployerId
        }, {
          onConflict: 'employer_id'
        })

      if (error) throw error
      toast.success('Billing configuration saved successfully')
    } catch (error) {
      console.error('Error saving config:', error)
      toast.error('Failed to save billing configuration')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-zinc-900 dark:to-zinc-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-emerald-600" />
          Billing Configuration
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
                <Label htmlFor="employee-rate">Base Rate per Employee</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="employee-rate"
                    type="number"
                    value={config.base_rate_per_employee || ''}
                    onChange={(e) => setConfig({ ...config, base_rate_per_employee: parseFloat(e.target.value) || 0 })}
                    className="pl-10"
                    placeholder="50.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="family-rate">Base Rate per Family Member</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="family-rate"
                    type="number"
                    value={config.base_rate_per_family_member || ''}
                    onChange={(e) => setConfig({ ...config, base_rate_per_family_member: parseFloat(e.target.value) || 0 })}
                    className="pl-10"
                    placeholder="25.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="included-visits">Included Visits per User</Label>
                <Input
                  id="included-visits"
                  type="number"
                  value={config.visit_included_per_user || ''}
                  onChange={(e) => setConfig({ ...config, visit_included_per_user: parseInt(e.target.value) || 0 })}
                  placeholder="2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="visit-price">Visit Overage Price</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="visit-price"
                    type="number"
                    value={config.visit_price || ''}
                    onChange={(e) => setConfig({ ...config, visit_price: parseFloat(e.target.value) || 0 })}
                    className="pl-10"
                    placeholder="75.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="billing-frequency">Billing Frequency</Label>
                <Select 
                  value={config.billing_frequency} 
                  onValueChange={(value) => setConfig({ ...config, billing_frequency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="annually">Annually</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="grace-period">Grace Period (days)</Label>
                <Input
                  id="grace-period"
                  type="number"
                  value={config.grace_period_days || ''}
                  onChange={(e) => setConfig({ ...config, grace_period_days: parseInt(e.target.value) || 0 })}
                  placeholder="30"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan-name">Custom Plan Name</Label>
              <Input
                id="plan-name"
                value={config.custom_plan_name || ''}
                onChange={(e) => setConfig({ ...config, custom_plan_name: e.target.value })}
                placeholder="e.g., Premium Health Plan"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Custom Notes</Label>
              <Textarea
                id="notes"
                value={config.custom_notes || ''}
                onChange={(e) => setConfig({ ...config, custom_notes: e.target.value })}
                placeholder="Any special billing arrangements or notes..."
                rows={3}
              />
            </div>

            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="w-full"
            >
              {saving ? (
                'Saving...'
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Configuration
                </>
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}