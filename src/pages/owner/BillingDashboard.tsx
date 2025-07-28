import React, { useState, useEffect } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { DollarSign, Users, Calculator, FileText, Package, Sparkles, Loader2 } from 'lucide-react'

export function BillingConfigPanel() {
  const [employers, setEmployers] = useState<any[]>([])
  const [selectedEmployerId, setSelectedEmployerId] = useState('')
  const [config, setConfig] = useState({
    base_rate_per_employee: '',
    base_rate_per_family_member: '',
    visit_included_per_user: '',
    visit_price: '',
    grace_period_days: '',
    custom_plan_name: '',
    custom_notes: ''
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchEmployers()
  }, [])

  const fetchEmployers = async () => {
    const { data } = await supabase.from('employers').select('id, name').eq('is_active', true)
    if (data) setEmployers(data)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await supabase.from('billing_configs').upsert({
        employer_id: selectedEmployerId,
        ...config
      })
      toast.success('Configuration saved!')
    } catch (error) {
      toast.error('Failed to save')
    }
    setSaving(false)
  }

  return (
    <Card className="bg-glass shadow-xl border border-white/10">
      <CardContent className="space-y-6 p-6">
        <h2 className="text-xl font-bold text-white drop-shadow flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Billing Configuration
        </h2>
        
        <Select value={selectedEmployerId} onValueChange={setSelectedEmployerId}>
          <SelectTrigger>
            <SelectValue placeholder="Select Employer" />
          </SelectTrigger>
          <SelectContent>
            {employers.map(emp => (
              <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input 
            placeholder="Base rate per employee ($)" 
            value={config.base_rate_per_employee}
            onChange={(e) => setConfig({...config, base_rate_per_employee: e.target.value})}
          />
          <Input 
            placeholder="Base rate per family member ($)"
            value={config.base_rate_per_family_member}
            onChange={(e) => setConfig({...config, base_rate_per_family_member: e.target.value})}
          />
          <Input 
            placeholder="Included visits per user"
            value={config.visit_included_per_user}
            onChange={(e) => setConfig({...config, visit_included_per_user: e.target.value})}
          />
          <Input 
            placeholder="Visit overage price ($)"
            value={config.visit_price}
            onChange={(e) => setConfig({...config, visit_price: e.target.value})}
          />
          <Input 
            placeholder="Grace period (days)"
            value={config.grace_period_days}
            onChange={(e) => setConfig({...config, grace_period_days: e.target.value})}
          />
          <Input 
            placeholder="Custom plan name"
            value={config.custom_plan_name}
            onChange={(e) => setConfig({...config, custom_plan_name: e.target.value})}
          />
        </div>
        <Textarea 
          placeholder="Custom notes" 
          rows={3}
          value={config.custom_notes}
          onChange={(e) => setConfig({...config, custom_notes: e.target.value})}
        />
        <Button className="w-full" onClick={handleSave} disabled={saving || !selectedEmployerId}>
          {saving ? 'Saving...' : 'Save Configuration'}
        </Button>
      </CardContent>
    </Card>
  )
}

export function FeatureToggles() {
  const [employers, setEmployers] = useState<any[]>([])
  const [selectedEmployerId, setSelectedEmployerId] = useState('')
  const [features, setFeatures] = useState([
    { key: 'meditation_module', name: 'Meditation Module', enabled: true, cost: 0 },
    { key: 'nutrition_tools', name: 'Nutrition Tools', enabled: true, cost: 0 },
    { key: 'ai_assistant_premium', name: 'AI Assistant Premium', enabled: false, cost: 10 },
    { key: 'voice_branding', name: 'Voice Branding', enabled: false, cost: 15 }
  ])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchEmployers()
  }, [])

  const fetchEmployers = async () => {
    const { data } = await supabase.from('employers').select('id, name').eq('is_active', true)
    if (data) setEmployers(data)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Save features logic here
      toast.success('Features saved!')
    } catch (error) {
      toast.error('Failed to save')
    }
    setSaving(false)
  }

  const totalCost = features.filter(f => f.enabled).reduce((sum, f) => sum + f.cost, 0)

  return (
    <Card className="bg-glass shadow-xl border border-white/10">
      <CardContent className="space-y-6 p-6">
        <h2 className="text-xl font-bold text-white drop-shadow">Feature Toggles</h2>
        
        <Select value={selectedEmployerId} onValueChange={setSelectedEmployerId}>
          <SelectTrigger>
            <SelectValue placeholder="Select Employer" />
          </SelectTrigger>
          <SelectContent>
            {employers.map(emp => (
              <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature, idx) => (
            <div key={feature.key} className="flex items-center gap-4 p-3 rounded-lg bg-white/5">
              <Switch 
                checked={feature.enabled}
                onCheckedChange={(checked) => {
                  const newFeatures = [...features]
                  newFeatures[idx].enabled = checked
                  setFeatures(newFeatures)
                }}
              />
              <span className="text-sm text-white flex-1">{feature.name}</span>
              <Input 
                className="w-20" 
                placeholder="$0.00"
                value={feature.cost}
                onChange={(e) => {
                  const newFeatures = [...features]
                  newFeatures[idx].cost = parseFloat(e.target.value) || 0
                  setFeatures(newFeatures)
                }}
              />
            </div>
          ))}
        </div>
        
        <div className="p-4 bg-emerald-500/20 rounded-lg">
          <p className="text-sm text-white">Total Additional Cost per User: <strong>${totalCost}</strong></p>
        </div>
        
        <Button className="w-full" onClick={handleSave} disabled={saving || !selectedEmployerId}>
          {saving ? 'Saving...' : 'Save Features'}
        </Button>
      </CardContent>
    </Card>
  )
}

export function InvoiceSimulator() {
  const [params, setParams] = useState({
    employees: 50,
    familyMembers: 25,
    visits: 150
  })
  const [result, setResult] = useState<any>(null)
  const [simulating, setSimulating] = useState(false)

  const simulate = async () => {
    setSimulating(true)
    // Simulate calculation
    const baseRate = 50
    const familyRate = 25
    const includedVisits = 2 * (params.employees + params.familyMembers)
    const overageVisits = Math.max(0, params.visits - includedVisits)
    const visitPrice = 75
    
    const total = (params.employees * baseRate) + 
                  (params.familyMembers * familyRate) + 
                  (overageVisits * visitPrice)
    
    setResult({
      baseCharges: params.employees * baseRate + params.familyMembers * familyRate,
      visitCharges: overageVisits * visitPrice,
      total
    })
    setSimulating(false)
  }

  return (
    <Card className="bg-glass shadow-xl border border-white/10">
      <CardContent className="space-y-6 p-6">
        <h2 className="text-xl font-bold text-white drop-shadow flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Invoice Simulator
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-white text-sm">Active Employees</Label>
            <Input 
              type="number"
              value={params.employees}
              onChange={(e) => setParams({...params, employees: parseInt(e.target.value) || 0})}
            />
          </div>
          <div>
            <Label className="text-white text-sm">Family Members</Label>
            <Input 
              type="number"
              value={params.familyMembers}
              onChange={(e) => setParams({...params, familyMembers: parseInt(e.target.value) || 0})}
            />
          </div>
          <div>
            <Label className="text-white text-sm">Total Visits</Label>
            <Input 
              type="number"
              value={params.visits}
              onChange={(e) => setParams({...params, visits: parseInt(e.target.value) || 0})}
            />
          </div>
        </div>
        <Button className="w-full" onClick={simulate} disabled={simulating}>
          {simulating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Calculating...</> : 'Simulate Invoice'}
        </Button>
        
        {result && (
          <Card className="bg-white/10 border-white/20">
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/80">Base Charges:</span>
                <span className="text-white">${result.baseCharges.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/80">Visit Charges:</span>
                <span className="text-white">${result.visitCharges.toLocaleString()}</span>
              </div>
              <div className="border-t border-white/20 pt-2 flex justify-between">
                <span className="text-white font-semibold">Total:</span>
                <span className="text-white font-bold text-lg">${result.total.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  )
}

export function ContractTracker() {
  const [contract, setContract] = useState({
    startDate: '',
    endDate: '',
    activeUsers: 0,
    expectedUsers: 100
  })
  const [saving, setSaving] = useState(false)

  const utilization = contract.expectedUsers > 0 
    ? Math.round((contract.activeUsers / contract.expectedUsers) * 100) 
    : 0

  return (
    <Card className="bg-glass shadow-xl border border-white/10">
      <CardContent className="space-y-6 p-6">
        <h2 className="text-xl font-bold text-white drop-shadow flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Contract Tracker
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="text-white text-sm">Start Date</Label>
            <Input 
              type="date"
              value={contract.startDate}
              onChange={(e) => setContract({...contract, startDate: e.target.value})}
            />
          </div>
          <div>
            <Label className="text-white text-sm">End Date</Label>
            <Input 
              type="date"
              value={contract.endDate}
              onChange={(e) => setContract({...contract, endDate: e.target.value})}
            />
          </div>
          <div>
            <Label className="text-white text-sm">Active Users</Label>
            <Input 
              type="number"
              value={contract.activeUsers}
              onChange={(e) => setContract({...contract, activeUsers: parseInt(e.target.value) || 0})}
            />
          </div>
        </div>
        
        <div className="p-4 bg-white/10 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-white">User Utilization</span>
            <span className="text-sm text-white font-bold">{utilization}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div 
              className="bg-emerald-500 h-2 rounded-full transition-all"
              style={{ width: `${utilization}%` }}
            />
          </div>
        </div>
        
        <Button className="w-full" disabled={saving}>
          {saving ? 'Updating...' : 'Update Tracker'}
        </Button>
      </CardContent>
    </Card>
  )
}

export function PlanPresetsLibrary() {
  const presets = [
    { name: 'Basic', price: '$35/user', visits: '1 visit/mo', color: 'bg-blue-500' },
    { name: 'Plus', price: '$50/user', visits: '2 visits/mo', color: 'bg-emerald-500' },
    { name: 'Enterprise', price: '$75/user', visits: '4 visits/mo', color: 'bg-purple-500' }
  ]

  return (
    <Card className="bg-glass shadow-xl border border-white/10">
      <CardContent className="space-y-6 p-6">
        <h2 className="text-xl font-bold text-white drop-shadow flex items-center gap-2">
          <Package className="h-5 w-5" />
          Plan Presets
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {presets.map((preset) => (
            <Card key={preset.name} className="bg-white/10 border-white/20 hover:bg-white/20 transition-all cursor-pointer">
              <CardContent className="p-4 space-y-2">
                <div className={`w-12 h-12 rounded-lg ${preset.color} mb-3`} />
                <h3 className="text-white font-semibold">{preset.name}</h3>
                <p className="text-white/80 text-sm">{preset.price}</p>
                <p className="text-white/60 text-xs">{preset.visits}</p>
                <Button variant="outline" className="w-full mt-3" size="sm">
                  Load Plan
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function AIPlanDesigner() {
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [generatedPlan, setGeneratedPlan] = useState<any>(null)

  const generatePlan = async () => {
    setGenerating(true)
    // Simulate AI generation
    setTimeout(() => {
      setGeneratedPlan({
        name: 'Custom Health Plus',
        employeeRate: 55,
        familyRate: 28,
        includedVisits: 3,
        features: ['AI Assistant', 'Telehealth', 'Meditation']
      })
      setGenerating(false)
    }, 2000)
  }

  return (
    <Card className="bg-glass shadow-xl border border-white/10">
      <CardContent className="space-y-6 p-6">
        <h2 className="text-xl font-bold text-white drop-shadow flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          AI Plan Designer
        </h2>
        <Textarea 
          placeholder="Describe the plan you want to create...\n\nExample: Create a budget-friendly plan for a startup with 50 employees. Include basic healthcare with AI features." 
          rows={6}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <Button className="w-full" onClick={generatePlan} disabled={generating || !prompt}>
          {generating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : 'Generate Plan Config'}
        </Button>
        
        {generatedPlan && (
          <Card className="bg-emerald-500/20 border-emerald-500/30">
            <CardContent className="p-4 space-y-3">
              <h3 className="text-white font-semibold">{generatedPlan.name}</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-white/80">Employee Rate:</span>
                <span className="text-white">${generatedPlan.employeeRate}/mo</span>
                <span className="text-white/80">Family Rate:</span>
                <span className="text-white">${generatedPlan.familyRate}/mo</span>
                <span className="text-white/80">Included Visits:</span>
                <span className="text-white">{generatedPlan.includedVisits}/mo</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {generatedPlan.features.map((f: string) => (
                  <Badge key={f} className="bg-white/20 text-white border-white/30">{f}</Badge>
                ))}
              </div>
              <Button className="w-full mt-3" size="sm">Apply This Plan</Button>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  )
}

export function AIInvoiceSummarizer() {
  const [selectedEmployer, setSelectedEmployer] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [generating, setGenerating] = useState(false)
  const [summary, setSummary] = useState<any>(null)

  const generateSummary = async () => {
    setGenerating(true)
    // Simulate AI summary generation
    setTimeout(() => {
      setSummary({
        employer: 'Acme Corp',
        users: 87,
        family: 12,
        overageVisits: 14,
        visitPrice: 60,
        visitCharges: 840,
        totalAmount: 5895,
        insights: 'Visit usage increased 15% from last month. Consider upgrading to Plus plan for better value.'
      })
      setGenerating(false)
    }, 2000)
  }

  return (
    <Card className="bg-glass shadow-xl border border-white/10">
      <CardContent className="space-y-6 p-6">
        <h2 className="text-xl font-bold text-white drop-shadow flex items-center gap-2">
          <FileText className="h-5 w-5" />
          AI Invoice Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-white">Select Employer</Label>
            <Select value={selectedEmployer} onValueChange={setSelectedEmployer}>
              <SelectTrigger>
                <SelectValue placeholder="Select employer..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="acme">Acme Corp</SelectItem>
                <SelectItem value="tech">Tech Innovators</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-white">Select Month</Label>
            <Input 
              type="month" 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          </div>
        </div>
        <Button 
          className="w-full" 
          onClick={generateSummary} 
          disabled={generating || !selectedEmployer || !selectedMonth}
        >
          {generating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : 'Generate AI Summary'}
        </Button>

        {summary && (
          <>
            <Card className="bg-white/10 border-white/20">
              <CardContent className="p-4 space-y-2">
                <p className="text-sm leading-relaxed text-white">
                  <strong>{summary.employer}</strong> had <strong>{summary.users} active users</strong> and{' '}
                  <strong>{summary.family} family members</strong> in{' '}
                  {new Date(selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.
                  There were <strong>{summary.overageVisits} overage visits</strong> billed at{' '}
                  <strong>${summary.visitPrice} each</strong>, totaling <strong>${summary.visitCharges}</strong>.
                  The total invoice amount was <strong className="text-lg">${summary.totalAmount.toLocaleString()}</strong>.
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-500/20 border-blue-500/30">
              <CardContent className="p-4">
                <p className="text-xs font-semibold text-white mb-1">💡 AI Insights</p>
                <p className="text-xs text-white/90">{summary.insights}</p>
              </CardContent>
            </Card>
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default function BillingDashboard() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-white drop-shadow">💼 Employer Billing Dashboard</h1>
      <Tabs defaultValue="config">
        <TabsList>
          <TabsTrigger value="config">Billing Config</TabsTrigger>
          <TabsTrigger value="features">Feature Toggles</TabsTrigger>
          <TabsTrigger value="simulator">Invoice Simulator</TabsTrigger>
          <TabsTrigger value="contracts">Contract Tracker</TabsTrigger>
          <TabsTrigger value="presets">Plan Presets</TabsTrigger>
          <TabsTrigger value="aiplan">AI Plan Designer</TabsTrigger>
          <TabsTrigger value="aisummary">AI Invoice Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="config">
          <BillingConfigPanel />
        </TabsContent>

        <TabsContent value="features">
          <FeatureToggles />
        </TabsContent>

        <TabsContent value="simulator">
          <InvoiceSimulator />
        </TabsContent>

        <TabsContent value="contracts">
          <ContractTracker />
        </TabsContent>

        <TabsContent value="presets">
          <PlanPresetsLibrary />
        </TabsContent>

        <TabsContent value="aiplan">
          <AIPlanDesigner />
        </TabsContent>

        <TabsContent value="aisummary">
          <AIInvoiceSummarizer />
        </TabsContent>
      </Tabs>
    </div>
  )
}