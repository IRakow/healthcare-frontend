import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Select from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  UserPlus, 
  Send, 
  Building2, 
  Shield, 
  Mail,
  Bot,
  Upload,
  Download,
  Search,
  Filter
} from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Invitation {
  id: string
  email: string
  company: string
  role: string
  status: 'pending' | 'accepted' | 'expired'
  sentAt: string
  acceptedAt?: string
}

export default function UserInvitations() {
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [bulkEmails, setBulkEmails] = useState('')
  const [aiPrompt, setAiPrompt] = useState('')
  const [invitations, setInvitations] = useState<Invitation[]>([
    {
      id: '1',
      email: 'john.doe@pmscorp.com',
      company: 'PMS Corp',
      role: 'Admin',
      status: 'pending',
      sentAt: '2025-01-25T10:00:00Z'
    },
    {
      id: '2',
      email: 'jane.smith@healthco.com',
      company: 'HealthCo',
      role: 'Manager',
      status: 'accepted',
      sentAt: '2025-01-24T14:30:00Z',
      acceptedAt: '2025-01-24T16:45:00Z'
    }
  ])

  const companies = [
    'PMS Corp',
    'HealthCo',
    'MediTech Solutions',
    'CareFirst Partners',
    'Wellness Group'
  ]

  const roles = [
    { value: 'admin', label: 'Admin', description: 'Full access to company portal' },
    { value: 'manager', label: 'Manager', description: 'Manage employees and view reports' },
    { value: 'hr', label: 'HR Manager', description: 'Employee management and benefits' },
    { value: 'finance', label: 'Finance Manager', description: 'Billing and invoice access' },
    { value: 'viewer', label: 'Viewer', description: 'Read-only access to reports' }
  ]

  const sendInvitation = async () => {
    // In production, this would call your backend API
    const newInvitation: Invitation = {
      id: Date.now().toString(),
      email,
      company,
      role,
      status: 'pending',
      sentAt: new Date().toISOString()
    }
    
    setInvitations([newInvitation, ...invitations])
    
    // Reset form
    setEmail('')
    setCompany('')
    setRole('')
    
    // Show success message
    alert('Invitation sent successfully!')
  }

  const processBulkInvitations = () => {
    const emails = bulkEmails.split('\n').filter(e => e.trim())
    console.log('Processing bulk invitations:', emails)
    alert(`Processing ${emails.length} invitations...`)
  }

  const processAIInvitations = async () => {
    // Simulate AI processing
    alert('AI is processing your request: ' + aiPrompt)
  }

  const exportInvitations = () => {
    const csv = invitations.map(inv => 
      `${inv.email},${inv.company},${inv.role},${inv.status},${inv.sentAt}`
    ).join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'invitations.csv'
    a.click()
  }

  return (
    <div className="p-6 max-w-screen-xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">User Invitations</h1>
          <p className="text-gray-600 mt-1">Invite users to PMS companies and manage their access</p>
        </div>
        <Button onClick={exportInvitations} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <Tabs defaultValue="single" className="space-y-4">
        <TabsList>
          <TabsTrigger value="single">Single Invitation</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
          <TabsTrigger value="ai">AI Assistant</TabsTrigger>
          <TabsTrigger value="history">Invitation History</TabsTrigger>
        </TabsList>

        <TabsContent value="single">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserPlus className="w-5 h-5 mr-2" />
                Send Individual Invitation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@company.com"
                />
              </div>

              <div>
                <Select
                  label="Company"
                  value={company}
                  onChange={setCompany}
                  options={companies.map(comp => ({ label: comp, value: comp }))}
                />
              </div>

              <div>
                <Select
                  label="Role"
                  value={role}
                  onChange={setRole}
                  options={roles.map(r => ({ label: `${r.label} - ${r.description}`, value: r.value }))}
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Invitation Preview</h4>
                <p className="text-sm text-blue-800">
                  An invitation will be sent to <strong>{email || '[email]'}</strong> to join 
                  <strong> {company || '[company]'}</strong> as a <strong>{role || '[role]'}</strong>.
                  They will receive an email with a secure link to set their password and access the platform.
                </p>
              </div>

              <Button 
                onClick={sendInvitation} 
                disabled={!email || !company || !role}
                className="w-full"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Invitation
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="w-5 h-5 mr-2" />
                Bulk Invitation Upload
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Upload CSV File</Label>
                <div className="mt-2 flex items-center gap-4">
                  <Input type="file" accept=".csv" />
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download Template
                  </Button>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  CSV format: email, company, role
                </p>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or paste emails</span>
                </div>
              </div>

              <div>
                <Label htmlFor="bulkEmails">Email List (one per line)</Label>
                <textarea
                  id="bulkEmails"
                  className="w-full p-2 border rounded-md h-32"
                  value={bulkEmails}
                  onChange={(e) => setBulkEmails(e.target.value)}
                  placeholder="john@company.com
jane@company.com
admin@pmscorp.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Select
                  value=""
                  onChange={() => {}}
                  options={[{ label: "Select company for all", value: "" }, ...companies.map(comp => ({ label: comp, value: comp }))]}
                />

                <Select
                  value=""
                  onChange={() => {}}
                  options={[{ label: "Select role for all", value: "" }, ...roles.map(r => ({ label: r.label, value: r.value }))]}
                />
              </div>

              <Button onClick={processBulkInvitations} className="w-full">
                <Send className="w-4 h-4 mr-2" />
                Send Bulk Invitations
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bot className="w-5 h-5 mr-2" />
                AI-Powered Invitations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="aiPrompt">Describe what you want to do</Label>
                <textarea
                  id="aiPrompt"
                  className="w-full p-3 border rounded-md h-32"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Examples:
- Invite all managers from HealthCo to the platform
- Send invitations to the finance team at PMS Corp
- Create admin accounts for john@company.com and jane@company.com
- Invite 5 HR managers to different companies"
                />
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-2">AI Capabilities</h4>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• Natural language processing for bulk operations</li>
                  <li>• Smart role assignment based on job titles</li>
                  <li>• Company matching and validation</li>
                  <li>• Duplicate detection and prevention</li>
                </ul>
              </div>

              <Button onClick={processAIInvitations} className="w-full">
                <Bot className="w-4 h-4 mr-2" />
                Process with AI
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Invitation History</CardTitle>
              <div className="flex gap-2 mt-4">
                <div className="flex-1">
                  <Input placeholder="Search by email or company..." />
                </div>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invitations.map(invitation => (
                  <div key={invitation.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <span className="font-medium">{invitation.email}</span>
                          <Badge 
                            variant={invitation.status === 'accepted' ? 'default' : 
                                    invitation.status === 'pending' ? 'secondary' : 'destructive'}
                          >
                            {invitation.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          <span className="inline-flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            {invitation.company}
                          </span>
                          <span className="mx-2">•</span>
                          <span className="inline-flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            {invitation.role}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          Sent: {new Date(invitation.sentAt).toLocaleDateString()}
                          {invitation.acceptedAt && (
                            <span> • Accepted: {new Date(invitation.acceptedAt).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {invitation.status === 'pending' && (
                          <>
                            <Button size="sm" variant="outline">Resend</Button>
                            <Button size="sm" variant="outline">Revoke</Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}