interface EmptyStateProps {
  title: string;
  subtitle?: string;
  icon?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ 
  title, 
  subtitle, 
  icon = '🩺',
  action 
}: EmptyStateProps) {
  return (
    <div className="text-center py-20 text-gray-500">
      <div className="text-6xl mb-4">{icon}</div>
      <h2 className="text-xl font-semibold">{title}</h2>
      {subtitle && <p className="text-sm mt-1">{subtitle}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

// Preset empty states for common scenarios
export function NoPatients() {
  return (
    <EmptyState 
      icon="👥"
      title="No patients found"
      subtitle="Start by adding your first patient"
    />
  );
}

export function NoAppointments() {
  return (
    <EmptyState 
      icon="📅"
      title="No appointments scheduled"
      subtitle="Your calendar is clear"
    />
  );
}

export function NoMedications() {
  return (
    <EmptyState 
      icon="💊"
      title="No medications recorded"
      subtitle="Add medications to track prescriptions"
    />
  );
}

export function NoLabResults() {
  return (
    <EmptyState 
      icon="🧪"
      title="No lab results available"
      subtitle="Lab results will appear here when ready"
    />
  );
}

export function NoInvoices() {
  return (
    <EmptyState 
      icon="📄"
      title="No invoices found"
      subtitle="Generate your first invoice to get started"
    />
  );
}

export function NoMessages() {
  return (
    <EmptyState 
      icon="💬"
      title="No messages yet"
      subtitle="Start a conversation with your healthcare provider"
    />
  );
}

export function NoVitals() {
  return (
    <EmptyState 
      icon="❤️"
      title="No vital signs recorded"
      subtitle="Record vitals to track your health"
    />
  );
}

export function NoInsurance() {
  return (
    <EmptyState 
      icon="🏥"
      title="No insurance information"
      subtitle="Add your insurance details for coverage info"
    />
  );
}

export function SearchEmpty() {
  return (
    <EmptyState 
      icon="🔍"
      title="No results found"
      subtitle="Try adjusting your search criteria"
    />
  );
}

export function ErrorState() {
  return (
    <EmptyState 
      icon="⚠️"
      title="Something went wrong"
      subtitle="Please try again or contact support"
    />
  );
}