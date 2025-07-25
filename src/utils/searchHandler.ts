import { nlpParser } from '@/services/nlpParser';

const routeMap = {
  patient: {
    'labs': '/patient/labs',
    'medications': '/patient/medications',
    'appointments': '/patient/appointments',
    'settings': '/patient/settings',
    'nutrition': '/patient/nutrition',
    'records': '/patient/records',
  },
  provider: {
    'dashboard': '/provider',
  },
  admin: {
    'employers': '/admin/employers',
    'invoices': '/admin/invoices',
    'audit': '/admin/audit',
  },
  owner: {
    'branding': '/employer/branding',
    'voice': '/employer/voice',
    'employees': '/employer/employees',
  }
};

export function handleSearch(input: string, role: string, navigate: (url: string) => void) {
  const map = routeMap[role as keyof typeof routeMap] || {};

  const key = Object.keys(map).find(k => input.toLowerCase().includes(k));
  if (key) {
    navigate(map[key as keyof typeof map]);
    return `Navigating to ${key}...`;
  }

  return '❓ I could not understand that command.';
}

// Alternative handler that uses the NLP parser
export function handleSearchWithNLP(
  input: string, 
  role: string, 
  navigate: (url: string) => void,
  onCommand?: (command: string, parsed: any) => void
) {
  const parsed = nlpParser.parseUserInput(input, role as any);
  
  if (!parsed) {
    return '❓ I could not understand that command.';
  }
  
  if (parsed.command === 'navigate' && parsed.page) {
    const map = routeMap[role as keyof typeof routeMap] || {};
    const destination = map[parsed.page as keyof typeof map];
    
    if (destination) {
      navigate(destination);
      return `Navigating to ${parsed.page}...`;
    }
  }
  
  // Handle non-navigation commands
  if (onCommand && parsed.parsed) {
    onCommand(parsed.command, parsed.parsed);
    return `Processing ${parsed.command.replace('_', ' ')}...`;
  }
  
  return '❓ I could not understand that command.';
}

// Example usage:
/*
import { useNavigate } from 'react-router-dom';
import { handleSearch } from '@/utils/searchHandler';

function MyComponent() {
  const navigate = useNavigate();
  const userRole = 'patient'; // Get from auth context
  
  const handleCommand = (input: string) => {
    const result = handleSearch(input, userRole, navigate);
    console.log(result);
  };
  
  // User says: "Show me my labs"
  handleCommand("Show me my labs"); // Returns: "Navigating to labs..."
}
*/