import { NavigateFunction } from 'react-router-dom';

interface CommandRoute {
  patterns: string[];
  route: string;
  description?: string;
}

const commandRoutes: CommandRoute[] = [
  {
    patterns: ['invoice', 'invoices', 'show invoices', 'view invoices', 'billing'],
    route: '/owner/invoices',
    description: 'View all invoices'
  },
  {
    patterns: ['employer', 'employers', 'companies', 'show employers'],
    route: '/owner/employers',
    description: 'View employers'
  },
  {
    patterns: ['dashboard', 'home', 'main', 'overview'],
    route: '/owner',
    description: 'Go to dashboard'
  },
  {
    patterns: ['report', 'reports', 'analytics', 'show reports'],
    route: '/owner/reports',
    description: 'View reports'
  },
  {
    patterns: ['payout', 'payouts', 'payments', 'show payouts'],
    route: '/owner/payouts',
    description: 'View payouts'
  },
  {
    patterns: ['branding', 'brand', 'customize', 'theme'],
    route: '/owner/branding',
    description: 'Branding settings'
  },
  {
    patterns: ['ai', 'assistant', 'ai config', 'ai settings'],
    route: '/owner/assistant-config',
    description: 'AI assistant configuration'
  },
  {
    patterns: ['voice', 'voice settings', 'voice selector'],
    route: '/owner/voice-selector',
    description: 'Voice settings'
  },
  {
    patterns: ['trends', 'spending', 'spending trends', 'analytics'],
    route: '/owner/spending-trends',
    description: 'Spending trends'
  },
  {
    patterns: ['statement', 'billing statement', 'statements'],
    route: '/owner/billing-statement',
    description: 'Billing statements'
  },
  {
    patterns: ['admin', 'invoice admin', 'manage invoices'],
    route: '/owner/invoice-admin',
    description: 'Invoice administration'
  }
];

export function handleCommand(command: string, navigate: NavigateFunction): boolean {
  const normalizedCommand = command.toLowerCase().trim();
  
  // Find matching route
  for (const commandRoute of commandRoutes) {
    for (const pattern of commandRoute.patterns) {
      if (normalizedCommand.includes(pattern)) {
        navigate(commandRoute.route);
        return true;
      }
    }
  }
  
  // No match found
  return false;
}

export function getSuggestions(input: string): CommandRoute[] {
  const normalizedInput = input.toLowerCase().trim();
  
  if (!normalizedInput) return commandRoutes.slice(0, 5); // Return top 5 if empty
  
  return commandRoutes.filter(route => 
    route.patterns.some(pattern => 
      pattern.includes(normalizedInput) || normalizedInput.includes(pattern)
    )
  );
}

export function getAllCommands(): CommandRoute[] {
  return commandRoutes;
}