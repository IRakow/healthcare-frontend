import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Sparkles, Loader2, Wand2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface GeneratedPlan {
  base_rate_per_employee: number
  base_rate_per_family_member: number
  visit_included_per_user: number
  visit_price: number
  billing_frequency: string
  custom_plan_name: string
  features: {
    [key: string]: boolean
  }
  reasoning: string
}

export function AIPlanDesigner() {
  const [employers, setEmployers] = useState<any[]>([])
  const [selectedEmployerId, setSelectedEmployerId] = useState<string>('')
  const [prompt, setPrompt] = useState<string>('')
  const [generating, setGenerating] = useState(false)
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null)
  const [applying, setApplying] = useState(false)

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

  const generatePlan = async () => {
    if (!prompt.trim()) {
      toast.error('Please describe the plan you want to create')
      return
    }

    setGenerating(true)
    try {
      const { data, error } = await supabase.functions.invoke('generate-billing-plan', {
        body: { 
          prompt,
          context: {
            employer_id: selectedEmployerId,
            typical_plans: {
              basic: { employee_rate: 35, family_rate: 20, included_visits: 1 },
              plus: { employee_rate: 50, family_rate: 25, included_visits: 2 },
              enterprise: { employee_rate: 75, family_rate: 35, included_visits: 4 }
            }
          }
        }
      })

      if (error) throw error

      setGeneratedPlan(data.plan)
      toast.success('Plan generated successfully!')
    } catch (error) {
      console.error('Error generating plan:', error)
      // Fallback to client-side generation
      generatePlanClientSide()
    } finally {
      setGenerating(false)
    }
  }

  const generatePlanClientSide = () => {
    const promptLower = prompt.toLowerCase()
    
    // Simple keyword-based plan generation
    let plan: GeneratedPlan = {
      base_rate_per_employee: 50,
      base_rate_per_family_member: 25,
      visit_included_per_user: 2,
      visit_price: 75,
      billing_frequency: 'monthly',
      custom_plan_name: 'Custom Health Plan',
      features: {
        meditation_module: true,
        nutrition_tools: true,
        ai_assistant_premium: false,
        voice_branding: false,
        advanced_analytics: false,
        telehealth_unlimited: false
      },
      reasoning: ''
    }

    // Adjust based on keywords
    if (promptLower.includes('small') || promptLower.includes('startup') || promptLower.includes('budget')) {
      plan.base_rate_per_employee = 30
      plan.base_rate_per_family_member = 15
      plan.visit_included_per_user = 1
      plan.custom_plan_name = 'Startup Health Essentials'
      plan.reasoning = 'Created a budget-friendly plan suitable for small teams and startups.'
    } else if (promptLower.includes('enterprise') || promptLower.includes('large') || promptLower.includes('comprehensive')) {
      plan.base_rate_per_employee = 85
      plan.base_rate_per_family_member = 40
      plan.visit_included_per_user = 5
      plan.custom_plan_name = 'Enterprise Health Suite'
      plan.features = {
        meditation_module: true,
        nutrition_tools: true,
        ai_assistant_premium: true,
        voice_branding: true,
        advanced_analytics: true,
        telehealth_unlimited: true
      }
      plan.reasoning = 'Designed a comprehensive enterprise plan with all premium features included.'
    } else if (promptLower.includes('unlimited') || promptLower.includes('concierge')) {
      plan.base_rate_per_employee = 150
      plan.base_rate_per_family_member = 60
      plan.visit_included_per_user = -1
      plan.visit_price = 0
      plan.custom_plan_name = 'Concierge Unlimited'
      plan.features = {
        meditation_module: true,
        nutrition_tools: true,
        ai_assistant_premium: true,
        voice_branding: true,
        advanced_analytics: true,
        telehealth_unlimited: true
      }
      plan.reasoning = 'Created an unlimited access plan with concierge-level service.'
    }

    // Adjust billing frequency
    if (promptLower.includes('annual') || promptLower.includes('yearly')) {
      plan.billing_frequency = 'annually'
    } else if (promptLower.includes('quarter')) {
      plan.billing_frequency = 'quarterly'
    }

    // Feature adjustments
    if (promptLower.includes('ai') || promptLower.includes('artificial intelligence')) {
      plan.features.ai_assistant_premium = true
    }
    if (promptLower.includes('telehealth') || promptLower.includes('virtual')) {
      plan.features.telehealth_unlimited = true
    }
    if (promptLower.includes('analytics') || promptLower.includes('data')) {
      plan.features.advanced_analytics = true
    }

    setGeneratedPlan(plan)
  }

  const applyGeneratedPlan = async () => {
    if (!selectedEmployerId || !generatedPlan) {
      toast.error('Please select an employer and generate a plan first')
      return
    }

    setApplying(true)
    try {
      // Create or update billing config
      const { data: configData, error: configError } = await supabase
        .from('billing_configs')
        .upsert({
          employer_id: selectedEmployerId,
          base_rate_per_employee: generatedPlan.base_rate_per_employee,
          base_rate_per_family_member: generatedPlan.base_rate_per_family_member,
          visit_included_per_user: generatedPlan.visit_included_per_user,
          visit_price: generatedPlan.visit_price,
          billing_frequency: generatedPlan.billing_frequency,
          custom_plan_name: generatedPlan.custom_plan_name,
          grace_period_days: 30,
          max_family_members_per_account: 5,
          is_active: true
        }, {
          onConflict: 'employer_id'
        })
        .select()
        .single()

      if (configError) throw configError

      // Update features
      const featureUpdates = Object.entries(generatedPlan.features).map(([key, enabled]) => ({
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

      toast.success('AI-generated plan applied successfully!')
      setGeneratedPlan(null)
      setPrompt('')
    } catch (error) {
      console.error('Error applying plan:', error)
      toast.error('Failed to apply generated plan')
    } finally {
      setApplying(false)
    }
  }

  return (
    <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-zinc-900 dark:to-zinc-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-emerald-600" />
          AI Plan Designer
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

        <div className="space-y-2">
          <Label htmlFor="prompt">Describe the plan you want to create</Label>
          <Textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Example: Create a budget-friendly plan for a startup with 50 employees. They want basic healthcare access with some AI features but need to keep costs low. Include quarterly billing."
            rows={6}
          />
          <p className="text-xs text-muted-foreground">
            Mention team size, budget constraints, desired features, and billing preferences
          </p>
        </div>

        <Button 
          onClick={generatePlan} 
          disabled={generating || !prompt.trim()}
          className="w-full"
        >
          {generating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Plan...
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" />
              Generate Plan Config
            </>
          )}
        </Button>

        {generatedPlan && (
          <Card className="bg-emerald-50 dark:bg-emerald-900/20">
            <CardHeader className="pb-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Generated Plan: {generatedPlan.custom_plan_name}
              </h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Employee Rate:</span>
                  <p className="font-medium">${generatedPlan.base_rate_per_employee}/mo</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Family Rate:</span>
                  <p className="font-medium">${generatedPlan.base_rate_per_family_member}/mo</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Included Visits:</span>
                  <p className="font-medium">
                    {generatedPlan.visit_included_per_user === -1 ? 'Unlimited' : generatedPlan.visit_included_per_user}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Billing:</span>
                  <p className="font-medium capitalize">{generatedPlan.billing_frequency}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Included Features:</p>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(generatedPlan.features)
                    .filter(([_, enabled]) => enabled)
                    .map(([feature]) => (
                      <Badge key={feature} variant="secondary" className="text-xs">
                        {feature.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </Badge>
                    ))}
                </div>
              </div>

              {generatedPlan.reasoning && (
                <p className="text-sm text-muted-foreground italic">
                  {generatedPlan.reasoning}
                </p>
              )}

              <Button
                onClick={applyGeneratedPlan}
                disabled={applying || !selectedEmployerId}
                className="w-full"
              >
                {applying ? 'Applying...' : 'Apply This Plan'}
              </Button>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  )
}