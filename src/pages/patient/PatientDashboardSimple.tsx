import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import PatientLayoutSimple from '@/components/layout/PatientLayoutSimple';
import { Stethoscope, Calendar, Bot, MessageSquare, Pill, Apple, FileText } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';

export default function PatientDashboardSimple() {
  const [tab, setTab] = useState('overview');
  const stats = {
    heartRate: '72 bpm',
    sleep: '7.5 hrs',
    protein: '65g',
    hydration: '64 oz',
    steps: '8,432',
    aiLogs: '3'
  };

  return (
    <PatientLayoutSimple>
      <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">Welcome Back</h1>
          <p className="text-muted-foreground text-sm md:text-base">Your personalized health dashboard</p>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          <StatCard label="Heart Rate" value={stats.heartRate} icon={<Stethoscope className="w-4 h-4" />} description="Resting" />
          <StatCard label="Sleep" value={stats.sleep} icon={<Calendar className="w-4 h-4" />} description="Last Night" />
          <StatCard label="Protein" value={stats.protein} icon={<Apple className="w-4 h-4" />} description="Today" />
          <StatCard label="Hydration" value={stats.hydration} icon={<Bot className="w-4 h-4" />} description="Goal: 80oz" />
          <StatCard label="Steps" value={stats.steps} icon={<Calendar className="w-4 h-4" />} description="So far" />
          <StatCard label="AI Logs" value={stats.aiLogs} icon={<Bot className="w-4 h-4" />} description="Today" />
        </motion.div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="medications">Medications</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Upcoming Appointments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Annual Checkup</p>
                      <p className="text-sm text-gray-500">Dr. Smith - Primary Care</p>
                    </div>
                    <p className="text-sm font-medium">Dec 15, 2:00 PM</p>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Lab Work</p>
                      <p className="text-sm text-gray-500">Quest Diagnostics</p>
                    </div>
                    <p className="text-sm font-medium">Dec 20, 9:00 AM</p>
                  </div>
                </div>
                <Button className="w-full mt-4" variant="outline">View All Appointments</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="w-5 h-5" />
                  AI Health Assistant
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">Get instant answers to your health questions</p>
                  <Button className="w-full">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Start Conversation
                  </Button>
                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-500 mb-2">Recent topics:</p>
                    <div className="space-y-1">
                      <p className="text-xs">• Medication side effects</p>
                      <p className="text-xs">• Exercise recommendations</p>
                      <p className="text-xs">• Nutrition planning</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Medications */}
          <TabsContent value="medications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="w-5 h-5" />
                  Current Medications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">Metformin</h4>
                        <p className="text-sm text-gray-500">500mg - Twice daily with meals</p>
                      </div>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">Lisinopril</h4>
                        <p className="text-sm text-gray-500">10mg - Once daily in the morning</p>
                      </div>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Active</span>
                    </div>
                  </div>
                  <Button className="w-full" variant="outline">View Medication History</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Nutrition */}
          <TabsContent value="nutrition">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Apple className="w-5 h-5" />
                  Today's Nutrition
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">1,850</p>
                      <p className="text-sm text-gray-600">Calories</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">65g</p>
                      <p className="text-sm text-gray-600">Protein</p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <p className="text-2xl font-bold text-yellow-600">210g</p>
                      <p className="text-sm text-gray-600">Carbs</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">70g</p>
                      <p className="text-sm text-gray-600">Fat</p>
                    </div>
                  </div>
                  <Button className="w-full">Log Meal</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents */}
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Recent Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="font-medium text-sm">Lab Results - CBC</p>
                        <p className="text-xs text-gray-500">Dec 1, 2024</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">View</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="font-medium text-sm">Visit Summary</p>
                        <p className="text-xs text-gray-500">Nov 15, 2024</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">View</Button>
                  </div>
                  <Button className="w-full" variant="outline">Upload Document</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PatientLayoutSimple>
  );
}