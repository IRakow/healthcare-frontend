import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import PatientLayoutGlass from '@/components/layout/PatientLayoutGlass';
import { Stethoscope, Calendar, Bot, MessageSquare, Pill, Apple, FileText, Droplets, Footprints, Moon } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import { publicDataService } from '@/services/publicDataService';

export default function PatientDashboardSimpleHybrid() {
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState<'live' | 'demo'>('demo');
  
  // Initialize with nice looking static data
  const [stats, setStats] = useState({
    heartRate: '72 bpm',
    sleep: '7.5 hrs',
    protein: '65g',
    hydration: '64 oz',
    steps: '8,432',
    aiLogs: '3'
  });

  const [nutritionData, setNutritionData] = useState({
    calories: 1850,
    protein: 65,
    carbs: 210,
    fat: 70
  });

  const [appointments, setAppointments] = useState([
    {
      id: '1',
      title: 'Annual Checkup',
      provider: 'Dr. Smith - Primary Care',
      date: 'Dec 15, 2024',
      time: '2:00 PM'
    },
    {
      id: '2',
      title: 'Lab Work',
      provider: 'Quest Diagnostics',
      date: 'Dec 20, 2024',
      time: '9:00 AM'
    }
  ]);

  const [medications, setMedications] = useState([
    {
      id: '1',
      name: 'Metformin',
      dosage: '500mg',
      frequency: 'Twice daily with meals',
      status: 'Active'
    },
    {
      id: '2',
      name: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once daily in the morning',
      status: 'Active'
    }
  ]);

  const [documents, setDocuments] = useState([
    {
      id: '1',
      name: 'Lab Results - CBC',
      type: 'Lab Report',
      date: 'Dec 1, 2024'
    },
    {
      id: '2',
      name: 'Visit Summary',
      type: 'Clinical Note',
      date: 'Nov 15, 2024'
    }
  ]);

  // Fetch data on mount
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      
      // Fetch health stats
      const statsResult = await publicDataService.getHealthStats();
      if (statsResult.success) {
        setStats({
          heartRate: statsResult.data.heartRate,
          sleep: statsResult.data.sleep,
          protein: statsResult.data.protein,
          hydration: statsResult.data.hydration,
          steps: statsResult.data.steps,
          aiLogs: statsResult.data.aiLogs
        });
        setNutritionData({
          calories: statsResult.data.calories,
          protein: parseInt(statsResult.data.protein),
          carbs: statsResult.data.carbs,
          fat: statsResult.data.fat
        });
        setDataSource('live');
      }

      // Fetch appointments
      const appointmentsResult = await publicDataService.getUpcomingAppointments();
      if (appointmentsResult.success && appointmentsResult.data.length > 0) {
        setAppointments(appointmentsResult.data);
      }

      // Fetch medications
      const medicationsResult = await publicDataService.getMedications();
      if (medicationsResult.success && medicationsResult.data.length > 0) {
        setMedications(medicationsResult.data);
      }

      // Fetch documents
      const documentsResult = await publicDataService.getRecentDocuments();
      if (documentsResult.success && documentsResult.data.length > 0) {
        setDocuments(documentsResult.data);
      }

      setLoading(false);
    };

    fetchAllData();
  }, []);

  return (
    <PatientLayoutGlass>
      <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">Welcome Back</h1>
              <p className="text-muted-foreground text-sm md:text-base">Your personalized health dashboard</p>
            </div>
            {dataSource === 'live' && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Live Data</span>
            )}
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.1 }} 
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4"
        >
          <StatCard 
            label="Heart Rate" 
            value={stats.heartRate} 
            icon={<Stethoscope className="w-4 h-4" />} 
            description="Resting" 
          />
          <StatCard 
            label="Sleep" 
            value={stats.sleep} 
            icon={<Moon className="w-4 h-4" />} 
            description="Last Night" 
          />
          <StatCard 
            label="Protein" 
            value={stats.protein} 
            icon={<Apple className="w-4 h-4" />} 
            description="Today" 
          />
          <StatCard 
            label="Hydration" 
            value={stats.hydration} 
            icon={<Droplets className="w-4 h-4" />} 
            description="Goal: 80oz" 
          />
          <StatCard 
            label="Steps" 
            value={stats.steps} 
            icon={<Footprints className="w-4 h-4" />} 
            description="So far" 
          />
          <StatCard 
            label="AI Logs" 
            value={stats.aiLogs} 
            icon={<Bot className="w-4 h-4" />} 
            description="Today" 
          />
        </motion.div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="medications">Medications</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
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
                  {appointments.map((apt) => (
                    <div key={apt.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{apt.title}</p>
                        <p className="text-sm text-gray-500">{apt.provider}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{apt.date}</p>
                        <p className="text-xs text-gray-500">{apt.time}</p>
                      </div>
                    </div>
                  ))}
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

          {/* Medications Tab */}
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
                  {medications.map((med) => (
                    <div key={med.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{med.name}</h4>
                          <p className="text-sm text-gray-500">{med.dosage} - {med.frequency}</p>
                        </div>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          {med.status}
                        </span>
                      </div>
                    </div>
                  ))}
                  <Button className="w-full" variant="outline">View Medication History</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Nutrition Tab */}
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
                      <p className="text-2xl font-bold text-blue-600">{nutritionData.calories.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Calories</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{nutritionData.protein}g</p>
                      <p className="text-sm text-gray-600">Protein</p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <p className="text-2xl font-bold text-yellow-600">{nutritionData.carbs}g</p>
                      <p className="text-sm text-gray-600">Carbs</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">{nutritionData.fat}g</p>
                      <p className="text-sm text-gray-600">Fat</p>
                    </div>
                  </div>
                  <Button className="w-full">Log Meal</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
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
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="font-medium text-sm">{doc.name}</p>
                          <p className="text-xs text-gray-500">{doc.date}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">View</Button>
                    </div>
                  ))}
                  <Button className="w-full" variant="outline">Upload Document</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PatientLayoutGlass>
  );
}