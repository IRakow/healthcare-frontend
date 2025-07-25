import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Building2, 
  Users, 
  TrendingUp, 
  DollarSign,
  Settings,
  Shield,
  Activity,
  Calendar,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Clock,
  Mail,
  Phone,
  Globe,
  CreditCard,
  FileText,
  Download,
  Eye,
  Edit,
  Trash2,
  Plus
} from 'lucide-react'

interface Company {
  id: string
  name: string
  subdomain: string
  status: 'active' | 'suspended' | 'trial' | 'cancelled'
  plan: 'starter' | 'professional' | 'enterprise'
  employees: number
  activePatients: number
  monthlySpend: number
  createdAt: string
  trialEndsAt?: string
  contact: {
    name: string
    email: string
    phone: string
  }
  billing: {
    method: string
    lastPayment: string
    nextPayment: string
  }
  usage: {
    appointments: number
    aiCalls: number
    storage: string
  }
}

export default function CompanyManagement() {
  const [companies] = useState<Company[]>([
    {
      id: '1',
      name: 'PMS Corp',
      subdomain: 'pmscorp',
      status: 'active',
      plan: 'enterprise',
      employees: 150,
      activePatients: 1200,
      monthlySpend: 15000,
      createdAt: '2024-01-15',
      contact: {
        name: 'John Doe',
        email: 'john@pmscorp.com',
        phone: '+1 555-0123'
      },
      billing: {
        method: 'Credit Card',
        lastPayment: '2025-01-01',
        nextPayment: '2025-02-01'
      },
      usage: {
        appointments: 450,
        aiCalls: 1200,
        storage: '45GB'
      }
    },
    {
      id: '2',
      name: 'HealthCo',
      subdomain: 'healthco',
      status: 'trial',
      plan: 'professional',
      employees: 50,
      activePatients: 400,
      monthlySpend: 0,
      createdAt: '2025-01-10',
      trialEndsAt: '2025-02-10',
      contact: {
        name: 'Jane Smith',
        email: 'jane@healthco.com',
        phone: '+1 555-0456'
      },
      billing: {
        method: 'Not set',
        lastPayment: 'N/A',
        nextPayment: 'Trial'
      },
      usage: {
        appointments: 25,
        aiCalls: 80,
        storage: '2GB'
      }
    }
  ])

  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [showNewCompanyForm, setShowNewCompanyForm] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default'
      case 'trial': return 'secondary'
      case 'suspended': return 'destructive'
      default: return 'outline'
    }
  }

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'enterprise': return 'default'
      case 'professional': return 'secondary'
      default: return 'outline'
    }
  }

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Company Management</h1>
          <p className="text-gray-600 mt-1">Manage PMS companies and their subscriptions</p>
        </div>
        <Button onClick={() => setShowNewCompanyForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Company
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Companies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">34</div>
            <p className="text-xs text-gray-500">+3 this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
            <p className="text-xs text-gray-500">82% active rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$212K</div>
            <p className="text-xs text-green-600">+12% growth</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8,420</div>
            <p className="text-xs text-gray-500">Across all companies</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Companies</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="trial">Trial</TabsTrigger>
          <TabsTrigger value="suspended">Suspended</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {companies.map(company => (
            <Card key={company.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Building2 className="w-6 h-6 text-gray-500" />
                      <h3 className="text-xl font-semibold">{company.name}</h3>
                      <Badge variant={getStatusColor(company.status)}>
                        {company.status}
                      </Badge>
                      <Badge variant={getPlanColor(company.plan)}>
                        {company.plan}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-gray-600">Subdomain</p>
                        <p className="font-medium flex items-center gap-1">
                          <Globe className="w-4 h-4" />
                          {company.subdomain}.insperityhealth.com
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Employees</p>
                        <p className="font-medium flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {company.employees}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Active Patients</p>
                        <p className="font-medium flex items-center gap-1">
                          <Activity className="w-4 h-4" />
                          {company.activePatients}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Monthly Spend</p>
                        <p className="font-medium flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          ${company.monthlySpend.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {company.trialEndsAt && (
                      <div className="mt-4 bg-yellow-50 p-3 rounded-lg flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm text-yellow-800">
                          Trial ends on {new Date(company.trialEndsAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Contact</p>
                        <p className="text-sm font-medium">{company.contact.name}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <Mail className="w-3 h-3" />
                          {company.contact.email}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {company.contact.phone}
                        </p>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Billing</p>
                        <p className="text-sm font-medium flex items-center gap-1">
                          <CreditCard className="w-4 h-4" />
                          {company.billing.method}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Next: {company.billing.nextPayment}
                        </p>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">Usage This Month</p>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Appointments</span>
                            <span className="font-medium">{company.usage.appointments}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>AI Calls</span>
                            <span className="font-medium">{company.usage.aiCalls}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span>Storage</span>
                            <span className="font-medium">{company.usage.storage}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedCompany(company)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* New Company Form Modal */}
      {showNewCompanyForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
            <CardHeader>
              <CardTitle>Create New Company</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Company Name</Label>
                  <Input placeholder="Acme Healthcare" />
                </div>
                <div>
                  <Label>Subdomain</Label>
                  <div className="flex">
                    <Input placeholder="acme" />
                    <span className="inline-flex items-center px-3 text-sm text-gray-500 bg-gray-50 border border-l-0 rounded-r-md">
                      .insperityhealth.com
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Plan</Label>
                  <select className="w-full p-2 border rounded-md">
                    <option>Starter - $299/mo</option>
                    <option>Professional - $999/mo</option>
                    <option>Enterprise - Custom</option>
                  </select>
                </div>
                <div>
                  <Label>Trial Period</Label>
                  <select className="w-full p-2 border rounded-md">
                    <option>14 days</option>
                    <option>30 days</option>
                    <option>No trial</option>
                  </select>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Primary Contact</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Name</Label>
                    <Input placeholder="John Doe" />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input type="email" placeholder="john@company.com" />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input placeholder="+1 555-0123" />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowNewCompanyForm(false)}>
                  Cancel
                </Button>
                <Button>Create Company</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}