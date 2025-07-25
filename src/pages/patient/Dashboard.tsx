import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Calendar,
  Heart,
  FileText,
  MessageSquare,
  Activity,
  Brain,
  Target
} from 'lucide-react'

export default function PatientDashboard() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    navigate('/patient/login')
  }

  const userEmail = user?.email || 'Guest User'

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Patient Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {userEmail}</p>
          </div>
          {user && (
            <button
              onClick={handleSignOut}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Sign Out
            </button>
          )}
          {!user && (
            <button
              onClick={() => navigate('/patient/login')}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Sign In
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Appointment</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Tomorrow</div>
              <p className="text-xs text-muted-foreground">Dr. Smith at 2:30 PM</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Health Score</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">85/100</div>
              <p className="text-xs text-muted-foreground">+5 from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-muted-foreground">2 completed this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Unread messages</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => navigate('/patient/appointments')}
                className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100"
              >
                <Calendar className="h-8 w-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium">Book Appointment</span>
              </button>
              
              <button 
                onClick={() => navigate('/patient/health-dashboard')}
                className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100"
              >
                <Brain className="h-8 w-8 text-purple-600 mb-2" />
                <span className="text-sm font-medium">Health Dashboard</span>
              </button>
              
              <button 
                onClick={() => navigate('/patient/records')}
                className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100"
              >
                <FileText className="h-8 w-8 text-green-600 mb-2" />
                <span className="text-sm font-medium">Medical Records</span>
              </button>
              
              <button 
                onClick={() => navigate('/patient/wearables')}
                className="flex flex-col items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100"
              >
                <Activity className="h-8 w-8 text-orange-600 mb-2" />
                <span className="text-sm font-medium">Wearables</span>
              </button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Calendar className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Appointment scheduled</p>
                    <p className="text-xs text-gray-500">With Dr. Johnson on Dec 15</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-green-100 rounded-full">
                    <FileText className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Lab results available</p>
                    <p className="text-xs text-gray-500">Blood work from Dec 10</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-purple-100 rounded-full">
                    <MessageSquare className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">New message from provider</p>
                    <p className="text-xs text-gray-500">Dr. Smith sent a message</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}