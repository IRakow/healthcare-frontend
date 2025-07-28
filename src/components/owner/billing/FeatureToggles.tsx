import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { Save, ToggleLeft, DollarSign } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Feature {
  id?: string
  feature_key: string
  feature_name: string
  description: string
  is_enabled: boolean
  additional_cost: number
}

const defaultFeatures: Feature[] = [
  {
    feature_key: 'meditation_module',
    feature_name: 'Meditation Module',
    description: 'Guided meditation and mindfulness exercises',
    is_enabled: true,
    additional_cost: 0
  },
  {
    feature_key: 'nutrition_tools',
    feature_name: 'Nutrition Tools',
    description: 'Meal tracking and dietary planning',
    is_enabled: true,
    additional_cost: 0
  },
  {
    feature_key: 'ai_assistant_premium',
    feature_name: 'AI Assistant Premium',
    description: 'Enhanced AI health assistant features',
    is_enabled: false,
    additional_cost: 10
  },
  {
    feature_key: 'voice_branding',
    feature_name: 'Voice Branding',
    description: 'Custom voice assistant with company branding',
    is_enabled: false,
    additional_cost: 15
  },
  {
    feature_key: 'advanced_analytics',
    feature_name: 'Advanced Analytics',
    description: 'Detailed health insights and reporting',
    is_enabled: false,
    additional_cost: 5
  },
  {
    feature_key: 'telehealth_unlimited',
    feature_name: 'Unlimited Telehealth',
    description: 'Unlimited virtual consultations',
    is_enabled: false,
    additional_cost: 20
  }
]

export function FeatureToggles() {
  const [employers, setEmployers] = useState<any[]>([])
  const [selectedEmployerId, setSelectedEmployerId] = useState<string>('')
  const [configId, setConfigId] = useState<string>('')
  const [features, setFeatures] = useState<Feature[]>(defaultFeatures)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchEmployers()
  }, [])

  useEffect(() => {
    if (selectedEmployerId) {
      fetchFeatures(selectedEmployerId)
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

  const fetchFeatures = async (employerId: string) => {
    try {
      // First get the billing config
      const { data: configData } = await supabase
        .from('billing_configs')
        .select('id')
        .eq('employer_id', employerId)
        .single()

      if (configData) {
        setConfigId(configData.id)
        
        // Then get the features
        const { data: featuresData } = await supabase
          .from('plan_features')
          .select('*')
          .eq('config_id', configData.id)

        if (featuresData && featuresData.length > 0) {
          // Merge with defaults to ensure all features are present
          const mergedFeatures = defaultFeatures.map(defaultFeature => {
            const savedFeature = featuresData.find(f => f.feature_key === defaultFeature.feature_key)
            return savedFeature || defaultFeature
          })
          setFeatures(mergedFeatures)
        } else {
          setFeatures(defaultFeatures)
        }
      } else {
        // No config exists yet
        setConfigId('')
        setFeatures(defaultFeatures)
      }
    } catch (error) {
      console.error('Error fetching features:', error)
    }
  }

  const handleToggle = (index: number) => {
    const newFeatures = [...features]
    newFeatures[index].is_enabled = !newFeatures[index].is_enabled
    setFeatures(newFeatures)
  }

  const handleCostChange = (index: number, cost: string) => {
    const newFeatures = [...features]
    newFeatures[index].additional_cost = parseFloat(cost) || 0
    setFeatures(newFeatures)
  }

  const handleSave = async () => {
    if (!selectedEmployerId) {
      toast.error('Please select an employer')
      return
    }

    setSaving(true)
    try {
      // Ensure billing config exists
      if (!configId) {
        const { data: newConfig, error: configError } = await supabase
          .from('billing_configs')
          .insert({
            employer_id: selectedEmployerId,
            base_rate_per_employee: 50,
            base_rate_per_family_member: 25,
            visit_included_per_user: 2,
            visit_price: 75
          })
          .select()
          .single()

        if (configError) throw configError
        setConfigId(newConfig.id)
      }

      // Upsert all features
      const featuresToSave = features.map(f => ({
        config_id: configId,
        feature_key: f.feature_key,
        feature_name: f.feature_name,
        description: f.description,
        is_enabled: f.is_enabled,
        additional_cost: f.additional_cost
      }))

      const { error } = await supabase
        .from('plan_features')
        .upsert(featuresToSave, {
          onConflict: 'config_id,feature_key'
        })

      if (error) throw error
      toast.success('Feature settings saved successfully')
    } catch (error) {
      console.error('Error saving features:', error)
      toast.error('Failed to save feature settings')
    } finally {
      setSaving(false)
    }
  }

  const getTotalAdditionalCost = () => {
    return features
      .filter(f => f.is_enabled)
      .reduce((sum, f) => sum + f.additional_cost, 0)
  }

  return (
    <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-zinc-900 dark:to-zinc-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ToggleLeft className="h-5 w-5 text-emerald-600" />
          Feature Toggles
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
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div key={feature.feature_key} className="flex items-start gap-4 p-4 border rounded-lg">
                  <Switch
                    checked={feature.is_enabled}
                    onCheckedChange={() => handleToggle(index)}
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Label className="text-base font-medium">
                        {feature.feature_name}
                      </Label>
                      {feature.is_enabled && feature.additional_cost > 0 && (
                        <Badge className="bg-emerald-100 text-emerald-800">
                          +${feature.additional_cost}/user
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      value={feature.additional_cost}
                      onChange={(e) => handleCostChange(index, e.target.value)}
                      className="w-24"
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
              <span className="text-sm font-medium">Total Additional Cost per User:</span>
              <span className="text-lg font-bold text-emerald-600">
                ${getTotalAdditionalCost().toFixed(2)}
              </span>
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
                  Save Feature Settings
                </>
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}