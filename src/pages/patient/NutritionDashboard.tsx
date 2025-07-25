import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import DietaryMacroChart from '@/components/nutrition/DietaryMacroChart'
import MealPhotoUpload from '@/components/nutrition/MealPhotoUpload'
import VoiceDietaryInput from '@/components/nutrition/VoiceDietaryInput'
import NutritionLog from './NutritionLog'
import { 
  Camera, 
  Mic, 
  BarChart3, 
  FileText,
  TrendingUp,
  Droplet,
  Apple,
  Target
} from 'lucide-react'

export default function NutritionDashboard() {
  const [activeTab, setActiveTab] = useState('overview')

  // Mock data for summary cards
  const todayStats = {
    calories: 1850,
    protein: 87,
    carbs: 202,
    fat: 64,
    water: 6,
    calorieGoal: 2200,
    proteinGoal: 100,
    waterGoal: 8
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Nutrition Tracking</h1>
        <p className="text-gray-600 mt-1">Track your meals, analyze nutrition, and reach your health goals</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
              Today's Calories
              <TrendingUp className="w-4 h-4 text-gray-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.calories}</div>
            <div className="text-xs text-gray-500">
              {todayStats.calorieGoal - todayStats.calories} remaining
            </div>
            <div className="mt-2 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${(todayStats.calories / todayStats.calorieGoal) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
              Protein
              <Target className="w-4 h-4 text-gray-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.protein}g</div>
            <div className="text-xs text-gray-500">
              {todayStats.proteinGoal - todayStats.protein}g to goal
            </div>
            <div className="mt-2 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-500 h-2 rounded-full"
                style={{ width: `${(todayStats.protein / todayStats.proteinGoal) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
              Water Intake
              <Droplet className="w-4 h-4 text-gray-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.water} cups</div>
            <div className="text-xs text-gray-500">
              {todayStats.waterGoal - todayStats.water} cups to goal
            </div>
            <div className="mt-2 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${(todayStats.water / todayStats.waterGoal) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center justify-between">
              Macros Balance
              <Apple className="w-4 h-4 text-gray-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Carbs</span>
                <span className="font-medium">{todayStats.carbs}g</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Fat</span>
                <span className="font-medium">{todayStats.fat}g</span>
              </div>
              <div className="text-xs text-green-600 mt-1">Well balanced!</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 w-full max-w-2xl mx-auto">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="log" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Food Log
          </TabsTrigger>
          <TabsTrigger value="photo" className="flex items-center gap-2">
            <Camera className="w-4 h-4" />
            Photo Entry
          </TabsTrigger>
          <TabsTrigger value="voice" className="flex items-center gap-2">
            <Mic className="w-4 h-4" />
            Voice Entry
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DietaryMacroChart />
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Meals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Breakfast</p>
                      <p className="text-sm text-gray-600">Oatmeal with berries</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">320 cal</p>
                      <p className="text-xs text-gray-500">8:30 AM</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Lunch</p>
                      <p className="text-sm text-gray-600">Grilled chicken salad</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">450 cal</p>
                      <p className="text-xs text-gray-500">12:45 PM</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Snack</p>
                      <p className="text-sm text-gray-600">Greek yogurt</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">150 cal</p>
                      <p className="text-xs text-gray-500">3:00 PM</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Nutrition Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Hydration Goal</h4>
                  <p className="text-sm text-blue-800">
                    You're 2 cups away from your daily water goal. Try setting reminders!
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Protein Intake</h4>
                  <p className="text-sm text-green-800">
                    Great job! You're on track to meet your protein goals today.
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-900 mb-2">Meal Timing</h4>
                  <p className="text-sm text-purple-800">
                    Consider adding a healthy snack between lunch and dinner.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="log" className="mt-6">
          <NutritionLog />
        </TabsContent>

        <TabsContent value="photo" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Meal Analysis</CardTitle>
              <p className="text-sm text-gray-600">
                Take a photo of your meal and our AI will analyze the nutritional content
              </p>
            </CardHeader>
            <CardContent>
              <MealPhotoUpload />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="voice" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Voice Food Entry</CardTitle>
              <p className="text-sm text-gray-600">
                Simply speak what you ate and we'll log it for you
              </p>
            </CardHeader>
            <CardContent>
              <VoiceDietaryInput />
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">How to use voice entry:</h4>
                <ul className="text-sm space-y-1 text-gray-700">
                  <li>• Click "Start Speaking" and describe your meal</li>
                  <li>• Example: "I had grilled chicken with rice and broccoli"</li>
                  <li>• Our AI will parse the foods and estimate nutrition</li>
                  <li>• Review and confirm before saving to your log</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}