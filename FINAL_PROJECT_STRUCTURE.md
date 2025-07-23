# 📁 FINAL Project File Structure

```
InsperityFront/
├── 📄 .env.example                    # Environment variables template
├── 📄 .gitignore                      # Git ignore file
├── 📄 index.html                      # Main HTML entry point
├── 📄 package.json                    # NPM dependencies and scripts
├── 📄 package-lock.json               # NPM lock file
├── 📄 tsconfig.json                   # TypeScript configuration
├── 📄 tailwind.config.ts              # Tailwind CSS configuration
├── 📄 vite.config.ts                  # Vite bundler configuration
├── 📄 vite-env.d.ts                   # Vite environment types
├── 📄 PROJECT_STRUCTURE.md            # Project structure documentation
├── 📄 FINAL_PROJECT_STRUCTURE.md      # This file - current structure
│
├── 📁 public/                         # Static assets (empty)
│
├── 📁 src/                            # Source code
│   ├── 📄 main.tsx                    # React app entry point
│   ├── 📄 App.tsx                     # Main app component with routes
│   ├── 📄 index.css                   # Global styles with Tailwind
│   ├── 📄 AdminOnboardingProgress.tsx # Admin onboarding component
│   │
│   ├── 📁 components/                 # Reusable components
│   │   ├── 📄 LogoutButton.tsx        # Shared logout button
│   │   │
│   │   ├── 📁 ui/                     # UI primitives (shadcn/ui style)
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
│   └── 📁 utils/                      # Utility functions
│       ├── 📄 ProtectedRoutes.tsx     # Route protection HOC
│       ├── 📄 logout.ts               # Logout utility
│       └── 📄 withAuth.tsx            # Auth wrapper HOC
│
├── 📁 node_modules/                   # NPM packages (git ignored)
├── 📁 dist/                           # Production build (git ignored)
│
└── 📄 [Various loose files in root]   # TO BE CLEANED UP:
    ├── AIHealthChat.tsx
    ├── AIRecipeExplainer.tsx
    ├── AdminOnboardingProgress.tsx
    ├── App.tsx
    ├── DailyGoalProgressBar.tsx
    ├── DietaryAssistantChat.tsx
    ├── DietaryOnboardingFlow.tsx
    ├── DietaryProgressTracker.tsx
    ├── EmployerPortal.tsx
    ├── EncounterView.tsx
    ├── FoodEntryTabs.tsx
    ├── HydrationTracker.tsx
    ├── ImageUploadForm.tsx
    ├── LoginPage.tsx
    ├── MainLayout.tsx
    ├── MealPhotoUpload.tsx
    ├── MealPrepPlanner.tsx
    ├── MeditationGenerator.tsx
    ├── MediterraneanDietOverview.tsx
    ├── NutrientBreakdownVisualizer.tsx
    ├── NutritionTipsCarousel.tsx
    ├── OwnerBillingView.tsx
    ├── OwnerDashboard.tsx
    ├── PatientAppointments.tsx
    ├── PatientChartPage.tsx
    ├── PatientDashboard.tsx
    ├── PatientFoodLogTimeline.tsx
    ├── PatientMealSummaryCard.tsx
    ├── PatientMedicalRecords.tsx
    ├── PatientPanel.tsx
    ├── ProviderAnalytics.tsx
    ├── ProviderDashboard.tsx
    ├── ProviderSchedule.tsx
    ├── RegisterPage.tsx
    ├── SecureMessaging.tsx
    ├── VideoAnalysisModule.tsx
    ├── VirtualVisit.tsx
    ├── VoiceHealthAssistant.tsx
    ├── WeeklyMealCompliance.tsx
    ├── WeeklyNutritionSummary.tsx
    ├── index.tsx
    ├── main.tsx
    └── routes.tsx
```

## 🏗️ Current Architecture

### ✅ Properly Organized:
- All main UI components in `/src/components/ui/`
- Role-specific components in `/src/components/[role]/`
- Main pages (logins, dashboards, primary sections) in `/src/pages/`
- Sub-pages in `/src/pages/[role]/` subdirectories
- Utilities, hooks, and lib properly separated

### ⚠️ Needs Cleanup:
- Multiple loose component files in the root directory
- These appear to be from a previous project structure
- Should be moved to appropriate directories or removed if unused

### 📍 Entry Points:
- Main entry: `/src/main.tsx`
- Routes defined in: `/src/App.tsx`
- Home page: `/src/pages/SimpleHomePage.tsx` (currently active)

### 🔧 Configuration:
- TypeScript: `tsconfig.json`
- Vite: `vite.config.ts`
- Tailwind CSS: `tailwind.config.ts`
- Path alias: `@/` → `/src/`

### 🚀 Build Status:
- ✅ Project builds successfully
- ✅ All imports resolved correctly
- ✅ TypeScript compilation passes