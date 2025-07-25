# Layout Components

## Header Component

The main header component with role-based navigation.

### Basic Usage:

```jsx
import { Header } from '@/components/layout/Header';

// In your component
<Header role="patient" userName="John Doe" />
```

### With AppLayout (Recommended):

```jsx
import { AppLayout } from '@/components/layout/AppLayout';

export default function MyPage() {
  return (
    <AppLayout>
      {/* Your page content */}
    </AppLayout>
  );
}
```

### Simple Header (for public pages):

```jsx
import { SimpleHeader } from '@/components/layout/SimpleHeader';

<SimpleHeader 
  showLogin={true}
  showBackButton={false}
  title="Welcome"
/>
```

## Features

1. **Role-based Navigation**: Automatically shows appropriate menu items based on user role
2. **Responsive**: Mobile-friendly with hamburger menu
3. **User Info**: Displays logged-in user name
4. **Logout**: Built-in logout functionality
5. **Animated Logo**: Eye-catching animated logo

## Role Navigation Items

- **Patient**: Dashboard, Appointments, Records, Family, Settings
- **Provider**: Dashboard, Calendar, Patients, Settings  
- **Admin**: Dashboard, Employers, Analytics, AI Logs, Settings
- **Owner**: Dashboard, Invoices, Reports, Settings

## Logo Component

Two variants available:

```jsx
import { Logo, LogoModern } from '@/components/ui/Logo';

// Classic medical cross with AI dots
<Logo size="md" animate />

// Modern heart shape with AI circuits
<LogoModern size="lg" animate />
```

## Customization

The header uses Tailwind classes and can be customized by:
1. Modifying the color scheme
2. Adding new navigation items
3. Changing the logo design
4. Adjusting responsive breakpoints