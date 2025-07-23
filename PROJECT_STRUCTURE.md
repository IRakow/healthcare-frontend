# 📁 Complete Project File Structure Schema

```
healthcare-frontend/
├── 📄 .env.example                    # Environment variables template
├── 📄 .gitignore                      # Git ignore file
├── 📄 index.html                      # Main HTML entry point
├── 📄 package.json                    # NPM dependencies and scripts
├── 📄 tsconfig.json                   # TypeScript configuration
├── 📄 vite.config.ts                  # Vite bundler configuration
├── 📄 README.md                       # Project documentation
├── 📄 PROJECT_STRUCTURE.md            # This file - project structure documentation
│
├── 📁 public/                         # Static assets
│   └── (favicon, images, etc.)
│
├── 📁 src/                            # Source code
│   ├── 📄 main.tsx                    # React app entry point
│   ├── 📄 App.tsx                     # Main app component with routes
│   ├── 📄 index.css                   # Global styles
│   │
│   ├── 📁 components/                 # Reusable components
│   │   ├── 📄 LogoutButton.tsx        # Shared logout button
│   │   │
│   │   ├── 📁 ui/                     # UI primitives (shadcn/ui)
│   │   │   ├── 📄 alert.tsx           # Alert component
│   │   │   ├── 📄 badge.tsx           # Badge component
│   │   │   ├── 📄 button.tsx          # Button component
│   │   │   ├── 📄 card.tsx            # Card components
│   │   │   ├── 📄 input.tsx           # Input component
│   │   │   ├── 📄 label.tsx           # Label component
│   │   │   ├── 📄 progress.tsx        # Progress bar
│   │   │   ├── 📄 select.tsx          # Select/dropdown
│   │   │   ├── 📄 tabs.tsx            # Tabs components
│   │   │   └── 📄 textarea.tsx        # Textarea component
│   │   │
│   │   ├── 📁 admin/                  # Admin-specific components
│   │   │   └── 📄 AdminSidebar.tsx    # Admin navigation sidebar
│   │   │
│   │   ├── 📁 owner/                  # Owner-specific components
│   │   │   └── 📄 OwnerSidebar.tsx    # Owner navigation sidebar
│   │   │
│   │   ├── 📁 voice/                  # Voice assistant components
│   │   │   └── 📄 DeepgramAssistant.tsx # Deepgram voice integration
│   │   │
│   │   └── 📁 assistant/              # AI assistant components
│   │       └── 📄 VoiceAssistant.tsx  # Voice assistant wrapper
│   │
│   ├── 📁 pages/                      # Page components
│   │   ├── 📄 HomePage.tsx            # Original home page (with useUser hook)
│   │   ├── 📄 SimpleHomePage.tsx      # Simplified home page (currently used)
│   │   ├── 📄 TestPage.tsx            # Test page for debugging
│   │   ├── 📄 VoiceAssistantDemo.tsx  # Voice assistant demo
│   │   │
│   │   ├── 📄 AdminLogin.tsx         # Admin login page
│   │   ├── 📄 AdminDashboard.tsx      # Admin main dashboard
│   │   ├── 📄 AdminEmployersPage.tsx  # Admin employer management
│   │   ├── 📄 AdminSettingsPage.tsx   # Admin settings
│   │   ├── 📄 AdminBillingPage.tsx    # Admin billing
│   │   │
│   │   ├── 📄 OwnerLogin.tsx         # Owner login page
│   │   ├── 📄 OwnerDashboard.tsx      # Owner main dashboard
│   │   ├── 📄 OwnerEmployeesPage.tsx  # Owner employee management
│   │   ├── 📄 OwnerAnalyticsPage.tsx  # Owner analytics
│   │   ├── 📄 OwnerBrandingPage.tsx   # Owner branding config
│   │   ├── 📄 OwnerInvoicesPage.tsx   # Owner invoices
│   │   │
│   │   ├── 📄 PatientLogin.tsx       # Patient login page
│   │   │
│   │   ├── 📁 admin/                  # Admin sub-pages
│   │   │   ├── 📄 AuditLog.tsx        # Audit logging system
│   │   │   ├── 📄 Backup.tsx          # Backup management
│   │   │   ├── 📄 Broadcast.tsx       # Mass messaging
│   │   │   └── 📄 TwilioSettings.tsx  # SMS configuration
│   │   │
│   │   ├── 📁 owner/                  # Owner sub-pages
│   │   │   ├── 📄 BrandingWizard.tsx  # Branding setup wizard
│   │   │   ├── 📄 EmployerAnalytics.tsx # Detailed analytics
│   │   │   └── 📄 EmployerSettings.tsx # Company settings
│   │   │
│   │   ├── 📁 patient/                # Patient sub-pages
│   │   │   ├── 📄 AppointmentAI.tsx   # AI appointment assistant
│   │   │   ├── 📄 AppointmentBooking.tsx # Book appointments
│   │   │   ├── 📄 Family.tsx          # Family members
│   │   │   ├── 📄 Goals.tsx           # Health goals
│   │   │   ├── 📄 HealthAIChat.tsx    # AI health chat
│   │   │   ├── 📄 MedicalRecords.tsx  # Medical records
│   │   │   ├── 📄 MeditationPage.tsx  # Meditation
│   │   │   ├── 📄 OnboardingForm.tsx  # Patient onboarding
│   │   │   ├── 📄 ProviderDirectory.tsx # Find providers
│   │   │   ├── 📄 Reports.tsx         # Health reports
│   │   │   ├── 📄 ReportsPDF.tsx      # PDF reports
│   │   │   ├── 📄 Timeline.tsx        # Health timeline
│   │   │   └── 📄 Wearables.tsx       # Wearable integration
│   │   │
│   │   └── 📁 provider/               # Provider sub-pages
│   │       ├── 📄 EncounterSummaries.tsx # Encounter list
│   │       ├── 📄 EncounterSummary.tsx # Single encounter
│   │       └── 📄 LabOrders.tsx       # Lab orders
│   │
│   ├── 📁 lib/                        # Libraries and utilities
│   │   └── 📄 supabase.ts             # Supabase client config
│   │
│   ├── 📁 hooks/                      # Custom React hooks
│   │   └── 📄 useUser.tsx             # User authentication hook
│   │
│   ├── 📁 utils/                      # Utility functions
│   │   ├── 📄 ProtectedRoutes.tsx     # Route protection HOC
│   │   ├── 📄 logout.ts               # Logout utility
│   │   └── 📄 withAuth.tsx            # Auth wrapper HOC
│   │
│   ├── 📁 types/                      # TypeScript type definitions
│   │   └── (type definition files)
│   │
│   └── 📁 contexts/                   # React contexts
│       └── (context providers)
│
├── 📁 node_modules/                   # NPM packages (git ignored)
├── 📁 dist/                           # Production build (git ignored)
└── 📁 .vercel/                        # Vercel deployment config
```

## 🏗️ Architecture Pattern

### Page Organization:
- Main pages go directly in `/src/pages/`
- Sub-pages go in `/src/pages/[role]/` folders
- Each role (admin, owner, patient, provider) has its own subfolder

### Component Organization:
- Shared UI components in `/src/components/ui/`
- Role-specific components in `/src/components/[role]/`
- Feature-specific components in their own folders

### Naming Conventions:
- **Pages**: PascalCase with descriptive names (e.g., `AdminDashboard.tsx`)
- **Components**: PascalCase matching their export
- **Utilities**: camelCase for functions
- **Hooks**: Start with `use` (e.g., `useUser.tsx`)

### Import Paths:
- Use `@/` alias for src directory
- Example: `import { Card } from '@/components/ui/card'`

### Current Status:
✅ All files have been organized according to this structure
✅ Import paths have been updated
✅ Build verified successfully

This structure follows React best practices and makes it easy to:
- Find files by their function
- Scale the application
- Maintain separation of concerns
- Share code between different user roles