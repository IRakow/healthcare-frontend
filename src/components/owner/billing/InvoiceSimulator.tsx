import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/lib/supabase'
import { Calculator, DollarSign, Users, Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface SimulationResult {
  baseCharges: number
  visitCharges: number
  featureCharges: number
  totalAmount: number
  breakdown: {
    employeeCost: number
    familyCost: number
    includedVisits: number
    billableVisits: number
    visitCost: number
  }
}

export function InvoiceSimulator() {
  const [employers, setEmployers] = useState<any[]>([])
  const [selectedEmployerId, setSelectedEmployerId] = useState<string>('')
  const [config, setConfig] = useState<any>(null)
  const [features, setFeatures] = useState<any[]>([])
  
  const [activeEmployees, setActiveEmployees] = useState<number>(50)
  const [familyMembers, setFamilyMembers] = useState<number>(25)
  const [totalVisits, setTotalVisits] = useState<number>(150)
  const [result, setResult] = useState<SimulationResult | null>(null)

  useEffect(() => {
    fetchEmployers()
  }, [])

  useEffect(() => {
    if (selectedEmployerId) {
      fetchConfig(selectedEmployerId)
    }
  }, [selectedEmployerId])

  useEffect(() => {
    if (config) {
      simulateInvoice()
    }
  }, [config, activeEmployees, familyMembers, totalVisits])

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
      // Get employer defaults
      const { data: employer } = await supabase
        .from('employers')
        .select('*')
        .eq('id', employerId)
        .single()

      // Get billing config override
      const { data: billingConfig } = await supabase
        .from('billing_configs')
        .select('*')
        .eq('employer_id', employerId)
        .single()

      // Get features
      if (billingConfig) {
        const { data: planFeatures } = await supabase
          .from('plan_features')
          .select('*')
          .eq('config_id', billingConfig.id)
          .eq('is_enabled', true)

        setFeatures(planFeatures || [])
      }

      // Merge configs
      const finalConfig = {
        base_rate_per_employee: billingConfig?.base_rate_per_employee || employer?.price_per_employee || 50,
        base_rate_per_family_member: billingConfig?.base_rate_per_family_member || employer?.price_per_family_member || 25,
        visit_included_per_user: billingConfig?.visit_included_per_user || 2,
        visit_price: billingConfig?.visit_price || 75,
        included_visits_per_year: employer?.included_visits_per_year || 0
      }

      setConfig(finalConfig)
    } catch (error) {
      console.error('Error fetching config:', error)
    }
  }

  const simulateInvoice = () => {
    if (!config) return

    const totalUsers = activeEmployees + familyMembers
    const employeeCost = activeEmployees * config.base_rate_per_employee
    const familyCost = familyMembers * config.base_rate_per_family_member
    const baseCharges = employeeCost + familyCost

    // Calculate included visits
    let includedVisits: number
    if (config.visit_included_per_user > 0) {
      // Monthly allowance
      includedVisits = config.visit_included_per_user * totalUsers
    } else if (config.included_visits_per_year > 0) {
      // Annual allowance pro-rated to monthly
      includedVisits = Math.round((config.included_visits_per_year / 12) * totalUsers)
    } else {
      includedVisits = 0
    }

    const billableVisits = Math.max(0, totalVisits - includedVisits)
    const visitCharges = billableVisits * config.visit_price

    // Calculate feature charges
    const featureCharges = features.reduce((sum, feature) => {
      return sum + (feature.additional_cost * totalUsers)
    }, 0)

    const totalAmount = baseCharges + visitCharges + featureCharges

    setResult({
      baseCharges,
      visitCharges,
      featureCharges,
      totalAmount,
      breakdown: {
        employeeCost,
        familyCost,
        includedVisits,
        billableVisits,
        visitCost: visitCharges
      }
    })
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
          <Calculator className="h-5 w-5 text-emerald-600" />
          Invoice Simulator
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

        {selectedEmployerId && config && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employees">Active Employees</Label>
                <Input
                  id="employees"
                  type="number"
                  value={activeEmployees}
                  onChange={(e) => setActiveEmployees(parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="family">Active Family Members</Label>
                <Input
                  id="family"
                  type="number"
                  value={familyMembers}
                  onChange={(e) => setFamilyMembers(parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="visits">Total Visits This Month</Label>
                <Input
                  id="visits"
                  type="number"
                  value={totalVisits}
                  onChange={(e) => setTotalVisits(parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>
            </div>

            {result && (
              <div className="space-y-4 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-gray-50 dark:bg-zinc-800">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">Base Subscription</h4>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{activeEmployees} employees × {formatCurrency(config.base_rate_per_employee)}</span>
                            <span className="font-medium">{formatCurrency(result.breakdown.employeeCost)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>{familyMembers} family × {formatCurrency(config.base_rate_per_family_member)}</span>
                            <span className="font-medium">{formatCurrency(result.breakdown.familyCost)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-50 dark:bg-zinc-800">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-muted-foreground">Visit Charges</h4>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Total visits</span>
                            <span>{totalVisits}</span>
                          </div>
                          <div className="flex justify-between text-sm text-emerald-600">
                            <span>Included visits</span>
                            <span>-{result.breakdown.includedVisits}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Billable visits × {formatCurrency(config.visit_price)}</span>
                            <span className="font-medium">{formatCurrency(result.breakdown.visitCost)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {features.length > 0 && (
                  <Card className="bg-gray-50 dark:bg-zinc-800">
                    <CardContent className="p-4">
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Feature Add-ons</h4>
                      <div className="space-y-1">
                        {features.map(feature => (
                          <div key={feature.id} className="flex justify-between text-sm">
                            <span>{feature.feature_name}</span>
                            <span>{formatCurrency(feature.additional_cost * (activeEmployees + familyMembers))}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="p-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Simulated Monthly Total</p>
                      <p className="text-3xl font-bold text-emerald-600">
                        {formatCurrency(result.totalAmount)}
                      </p>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-800">
                      {activeEmployees + familyMembers} total users
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}