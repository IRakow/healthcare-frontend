import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Sparkles, Package, Building2, Rocket } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface PlanPreset {
  name: string
  icon: React.ReactNode
  description: string
  config: {
    base_rate_per_employee: number
    base_rate_per_family_member: number
    visit_included_per_user: number
    visit_price: number
    billing_frequency: string
    grace_period_days: number
    max_family_members_per_account: number
    custom_plan_name: string
  }
  features: {
    meditation_module: boolean
    nutrition_tools: boolean
    ai_assistant_premium: boolean
    voice_branding: boolean
    advanced_analytics: boolean
    telehealth_unlimited: boolean
  }
}

const planPresets: PlanPreset[] = [
  {
    name: 'Basic',
    icon: <Package className="h-5 w-5" />,
    description: 'Essential healthcare access for small teams',
    config: {
      base_rate_per_employee: 35,
      base_rate_per_family_member: 20,
      visit_included_per_user: 1,
      visit_price: 60,
      billing_frequency: 'monthly',
      grace_period_days: 30,
      max_family_members_per_account: 3,
      custom_plan_name: 'Basic Health Plan'
    },
    features: {
      meditation_module: true,
      nutrition_tools: true,
      ai_assistant_premium: false,
      voice_branding: false,
      advanced_analytics: false,
      telehealth_unlimited: false
    }
  },
  {
    name: 'Plus',
    icon: <Sparkles className="h-5 w-5" />,
    description: 'Enhanced benefits with AI features',
    config: {
      base_rate_per_employee: 50,
      base_rate_per_family_member: 25,
      visit_included_per_user: 2,
      visit_price: 75,
      billing_frequency: 'monthly',
      grace_period_days: 30,
      max_family_members_per_account: 5,
      custom_plan_name: 'Plus Health Plan'
    },
    features: {
      meditation_module: true,
      nutrition_tools: true,
      ai_assistant_premium: true,
      voice_branding: false,
      advanced_analytics: true,
      telehealth_unlimited: false
    }
  },
  {
    name: 'Enterprise',
    icon: <Building2 className="h-5 w-5" />,
    description: 'Full-featured plan for large organizations',
    config: {
      base_rate_per_employee: 75,
      base_rate_per_family_member: 35,
      visit_included_per_user: 4,
      visit_price: 50,
      billing_frequency: 'quarterly',
      grace_period_days: 45,
      max_family_members_per_account: 10,
      custom_plan_name: 'Enterprise Health Suite'
    },
    features: {
      meditation_module: true,
      nutrition_tools: true,
      ai_assistant_premium: true,
      voice_branding: true,
      advanced_analytics: true,
      telehealth_unlimited: true
    }
  },
  {
    name: 'Premium',
    icon: <Rocket className="h-5 w-5" />,
    description: 'White-glove service with unlimited access',
    config: {
      base_rate_per_employee: 120,
      base_rate_per_family_member: 50,
      visit_included_per_user: -1, // Unlimited
      visit_price: 0,
      billing_frequency: 'annually',
      grace_period_days: 60,
      max_family_members_per_account: -1, // Unlimited
      custom_plan_name: 'Premium Concierge Health'
    },
    features: {
      meditation_module: true,
      nutrition_tools: true,
      ai_assistant_premium: true,
      voice_branding: true,
      advanced_analytics: true,
      telehealth_unlimited: true
    }
  }
]

export function PlanPresetsLibrary() {
  const [employers, setEmployers] = useState<any[]>([])
  const [selectedEmployerId, setSelectedEmployerId] = useState<string>('')
  const [applying, setApplying] = useState<string | null>(null)

  React.useEffect(() => {
    fetchEmployers()
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

  const applyPreset = async (preset: PlanPreset) => {
    if (!selectedEmployerId) {
      toast.error('Please select an employer first')
      return
    }

    setApplying(preset.name)
    try {
      // First, create or update billing config
      const { data: configData, error: configError } = await supabase
        .from('billing_configs')
        .upsert({
          employer_id: selectedEmployerId,
          ...preset.config,
          is_active: true
        }, {
          onConflict: 'employer_id'
        })
        .select()
        .single()

      if (configError) throw configError

      // Then, update features
      const featureUpdates = Object.entries(preset.features).map(([key, enabled]) => ({
        config_id: configData.id,
        feature_key: key,
        feature_name: key.split('_').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' '),
        is_enabled: enabled,
        additional_cost: enabled && ['ai_assistant_premium', 'voice_branding', 'telehealth_unlimited'].includes(key) 
          ? (key === 'ai_assistant_premium' ? 10 : key === 'voice_branding' ? 15 : 20) 
          : 0
      }))

      const { error: featuresError } = await supabase
        .from('plan_features')
        .upsert(featureUpdates, {
          onConflict: 'config_id,feature_key'
        })

      if (featuresError) throw featuresError

      toast.success(`${preset.name} plan applied successfully!`)
    } catch (error) {
      console.error('Error applying preset:', error)
      toast.error('Failed to apply plan preset')
    } finally {
      setApplying(null)
    }
  }

  return (
    <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-zinc-900 dark:to-zinc-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-emerald-600" />
          Plan Presets Library
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="employer">Select Employer</Label>
          <Select value={selectedEmployerId} onValueChange={setSelectedEmployerId}>
            <SelectTrigger>
              <SelectValue placeholder="Choose an employer to apply preset..." />
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {planPresets.map((preset) => (
            <Card key={preset.name} className="relative overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                      {preset.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold">{preset.name}</h3>
                      <p className="text-sm text-muted-foreground">{preset.description}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Employee Rate</span>
                    <span className="font-medium">${preset.config.base_rate_per_employee}/mo</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Family Rate</span>
                    <span className="font-medium">${preset.config.base_rate_per_family_member}/mo</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Included Visits</span>
                    <span className="font-medium">
                      {preset.config.visit_included_per_user === -1 ? 'Unlimited' : preset.config.visit_included_per_user}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Billing</span>
                    <span className="font-medium capitalize">{preset.config.billing_frequency}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {Object.entries(preset.features).filter(([_, enabled]) => enabled).map(([feature]) => (
                    <Badge key={feature} variant="secondary" className="text-xs">
                      {feature.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </Badge>
                  ))}
                </div>

                <Button
                  className="w-full"
                  onClick={() => applyPreset(preset)}
                  disabled={!selectedEmployerId || applying === preset.name}
                >
                  {applying === preset.name ? 'Applying...' : `Apply ${preset.name} Plan`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}