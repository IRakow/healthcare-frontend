import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  UserPlus, 
  Building2, 
  Bot, 
  Shield,
  DollarSign,
  BarChart3,
  Globe,
  Mail,
  Database,
  Settings,
  Zap,
  Brain,
  Activity,
  FileText,
  CreditCard,
  Users,
  TrendingUp,
  Server
} from 'lucide-react'

export default function OwnerFeatures() {
  const navigate = useNavigate()

  const features = [
    {
      category: "User & Company Management",
      icon: Users,
      color: "bg-blue-500",
      items: [
        {
          title: "User Invitations System",
          description: "Invite users to PMS companies with role-based access",
          features: [
            "Single & bulk email invitations",
            "AI-powered bulk operations",
            "Role assignment (Admin, Manager, HR, Finance, Viewer)",
            "Email templates with secure password setup links",
            "Invitation tracking and history",
            "CSV import/export capabilities"
          ],
          path: "/owner/user-invitations"
        },
        {
          title: "Company Management",
          description: "Complete control over PMS companies",
          features: [
            "Create and manage companies",
            "Custom subdomains (company.insperityhealth.com)",
            "Subscription plan management",
            "Usage monitoring and limits",
            "Company-specific branding",
            "Trial period management"
          ],
          path: "/owner/company-management"
        }
      ]
    },
    {
      category: "Platform Intelligence",
      icon: Brain,
      color: "bg-purple-500",
      items: [
        {
          title: "AI Command Center",
          description: "Natural language platform control",
          features: [
            "Ask questions like 'Show companies ready to upgrade'",
            "Automated insights and recommendations",
            "Revenue opportunity detection",
            "Churn risk alerts",
            "Growth pattern analysis",
            "Smart report generation"
          ],
          path: "/owner/platform"
        },
        {
          title: "Real-time Analytics",
          description: "Comprehensive platform metrics",
          features: [
            "Revenue tracking and projections",
            "User engagement analytics",
            "API usage monitoring",
            "System health dashboard",
            "Custom report builder",
            "Export capabilities"
          ],
          path: "/owner/reports"
        }
      ]
    },
    {
      category: "Billing & Revenue",
      icon: DollarSign,
      color: "bg-green-500",
      items: [
        {
          title: "Subscription Management",
          description: "Complete billing control",
          features: [
            "Plan creation and pricing",
            "Invoice generation and sending",
            "Payment processing",
            "Billing statements",
            "Revenue forecasting",
            "Payout management"
          ],
          path: "/owner/billing-statement"
        },
        {
          title: "Financial Analytics",
          description: "Deep revenue insights",
          features: [
            "Spending trends analysis",
            "Company-wise revenue breakdown",
            "Invoice tracking",
            "Payment history",
            "Financial reports",
            "Tax documentation"
          ],
          path: "/owner/spending-trends"
        }
      ]
    },
    {
      category: "System Administration",
      icon: Server,
      color: "bg-red-500",
      items: [
        {
          title: "Platform Monitoring",
          description: "System health and performance",
          features: [
            "Real-time system metrics",
            "CPU, memory, storage monitoring",
            "API performance tracking",
            "Uptime monitoring",
            "Error tracking and alerts",
            "Audit logs"
          ],
          path: "/owner/audit-logs"
        },
        {
          title: "Security & Compliance",
          description: "Enterprise-grade security",
          features: [
            "Role-based access control",
            "Activity logging",
            "Compliance reporting",
            "Data backup management",
            "Security settings",
            "API key management"
          ],
          path: "/owner/security"
        }
      ]
    }
  ]

  const quickStats = [
    { label: "Total Companies", value: "34", change: "+3 this month" },
    { label: "Active Users", value: "8,420", change: "+142 this week" },
    { label: "Monthly Revenue", value: "$212K", change: "+12% growth" },
    { label: "Platform Uptime", value: "99.9%", change: "Excellent" }
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Purity Health Owner Portal
          </h1>
          <p className="text-xl text-gray-600">
            Complete platform control with AI-powered management
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {quickStats.map((stat, idx) => (
            <Card key={idx}>
              <CardContent className="p-4">
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Access Button */}
        <div className="text-center mb-8">
          <Button 
            size="lg"
            onClick={() => navigate('/owner')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Zap className="w-5 h-5 mr-2" />
            Access Platform Dashboard
          </Button>
        </div>

        {/* Features Grid */}
        <div className="space-y-8">
          {features.map((category, idx) => (
            <div key={idx}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg ${category.color}`}>
                  <category.icon className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">{category.category}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {category.items.map((item, itemIdx) => (
                  <Card key={itemIdx} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle>{item.title}</CardTitle>
                      <p className="text-gray-600">{item.description}</p>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 mb-4">
                        {item.features.map((feature, fIdx) => (
                          <li key={fIdx} className="flex items-start">
                            <span className="text-green-500 mr-2">•</span>
                            <span className="text-sm text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => navigate(item.path)}
                      >
                        Explore {item.title}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Additional Features */}
        <Card className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50">
          <CardHeader>
            <CardTitle className="text-2xl">Additional Platform Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  White-Label Support
                </h3>
                <p className="text-sm text-gray-700">
                  Custom branding, domains, and complete white-label solution for each company
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Enterprise Security
                </h3>
                <p className="text-sm text-gray-700">
                  HIPAA compliant, SOC 2 certified, end-to-end encryption, and audit trails
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  API Integration
                </h3>
                <p className="text-sm text-gray-700">
                  RESTful APIs, webhooks, and integrations with popular healthcare systems
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}