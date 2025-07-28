import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabase'
import { Settings, Save, DollarSign, Users, Calendar, CreditCard } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'

interface BillingConfig {
  id?: string
  employer_id: string
  base_rate_per_employee: number
  base_rate_per_family_member: number
  visit_included_per_user: number
  visit_price: number
  billing_frequency: 'monthly' | 'quarterly'
  grace_period_days: number
  allow_family_members: boolean
  max_family_members_per_account: number
  subscription_type: 'employer' | 'direct'
  custom_plan_name: string
  custom_notes: string
}

interface BillingConfigManagerProps {
  employerId: string
  employerName: string
}

export default function BillingConfigManager({ employerId, employerName }: BillingConfigManagerProps) {
  const [config, setConfig] = useState<BillingConfig>({
    employer_id: employerId,
    base_rate_per_employee: 50,
    base_rate_per_family_member: 25,
    visit_included_per_user: 2,
    visit_price: 75,
    billing_frequency: 'monthly',
    grace_period_days: 30,
    allow_family_members: true,
    max_family_members_per_account: 5,
    subscription_type: 'employer',
    custom_plan_name: '',
    custom_notes: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchConfig()
  }, [employerId])

  const fetchConfig = async () => {
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
      console.error('Error fetching config:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('billing_configs')
        .upsert({
          ...config,
          employer_id: employerId
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

  const calculateMonthlyRevenue = () => {
    const employeeRevenue = config.base_rate_per_employee * 100 // Assuming 100 employees
    const familyRevenue = config.allow_family_members 
      ? config.base_rate_per_family_member * 50 // Assuming 50 family members
      : 0
    return employeeRevenue + familyRevenue
  }

  if (loading) {
    return <Card><CardContent className="p-6">Loading...</CardContent></Card>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Billing Configuration - {employerName}
        </CardTitle>
        <CardDescription>
          Configure subscription pricing and billing rules for this employer
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Plan Name */}
        <div className="space-y-2">
          <Label htmlFor="plan-name">Custom Plan Name</Label>
          <Input
            id="plan-name"
            value={config.custom_plan_name}
            onChange={(e) => setConfig({ ...config, custom_plan_name: e.target.value })}
            placeholder="e.g., Premium Health Plan"
          />
        </div>

        {/* Base Rates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="employee-rate">Base Rate per Employee</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="employee-rate"
                type="number"
                value={config.base_rate_per_employee}
                onChange={(e) => setConfig({ ...config, base_rate_per_employee: parseFloat(e.target.value) })}
                className="pl-10"
                step="0.01"
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
                value={config.base_rate_per_family_member}
                onChange={(e) => setConfig({ ...config, base_rate_per_family_member: parseFloat(e.target.value) })}
                className="pl-10"
                disabled={!config.allow_family_members}
                step="0.01"
              />
            </div>
          </div>
        </div>

        {/* Visit Pricing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="included-visits">Included Visits per User</Label>
            <Input
              id="included-visits"
              type="number"
              value={config.visit_included_per_user}
              onChange={(e) => setConfig({ ...config, visit_included_per_user: parseInt(e.target.value) })}
              min="0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="visit-price">Price per Additional Visit</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="visit-price"
                type="number"
                value={config.visit_price}
                onChange={(e) => setConfig({ ...config, visit_price: parseFloat(e.target.value) })}
                className="pl-10"
                step="0.01"
              />
            </div>
          </div>
        </div>

        {/* Billing Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="billing-frequency">Billing Frequency</Label>
            <Select
              value={config.billing_frequency}
              onValueChange={(value: 'monthly' | 'quarterly') => 
                setConfig({ ...config, billing_frequency: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="grace-period">Grace Period (days)</Label>
            <Input
              id="grace-period"
              type="number"
              value={config.grace_period_days}
              onChange={(e) => setConfig({ ...config, grace_period_days: parseInt(e.target.value) })}
              min="0"
            />
          </div>
        </div>

        {/* Family Settings */}
        <div className="space-y-4 p-4 bg-gray-50 dark:bg-zinc-900/50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Allow Family Members</Label>
              <p className="text-sm text-muted-foreground">
                Enable employees to add family members to their accounts
              </p>
            </div>
            <Switch
              checked={config.allow_family_members}
              onCheckedChange={(checked) => 
                setConfig({ ...config, allow_family_members: checked })
              }
            />
          </div>
          {config.allow_family_members && (
            <div className="space-y-2">
              <Label htmlFor="max-family">Max Family Members per Account</Label>
              <Input
                id="max-family"
                type="number"
                value={config.max_family_members_per_account}
                onChange={(e) => setConfig({ ...config, max_family_members_per_account: parseInt(e.target.value) })}
                min="1"
                max="10"
              />
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Custom Notes</Label>
          <Textarea
            id="notes"
            value={config.custom_notes}
            onChange={(e) => setConfig({ ...config, custom_notes: e.target.value })}
            placeholder="Any special billing arrangements or notes..."
            rows={3}
          />
        </div>

        {/* Revenue Preview */}
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Estimated Monthly Revenue
          </h4>
          <p className="text-2xl font-bold text-emerald-600">
            ${calculateMonthlyRevenue().toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Based on 100 employees and 50 family members
          </p>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full"
        >
          {saving ? (
            <>Saving...</>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Configuration
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}