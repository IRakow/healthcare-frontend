import { handleAiIntent } from '@/ai/actions/handleAiIntent';

export async function handleSearchIntent(userId: string, intent: any, navigate: (url: string) => void) {
  if (!intent || !intent.command) {
    return '❓ I could not understand that request.';
  }

  if (intent.command === 'navigate') {
    const routes = {
      'dashboard': '/patient',
      'appointments': '/patient/appointments',
      'medications': '/patient/medications',
      'labs': '/patient/labs',
      'invoices': '/employer/invoices',
      'branding': '/employer/branding',
      'settings': '/patient/settings',
      'calendar': '/patient/calendar'
    };
    const target = routes[intent.page as keyof typeof routes] || '/patient';
    navigate(target);
    return `🧭 Navigating to ${intent.page}`;
  }

  if (['book_appointment', 'add_medication'].includes(intent.command)) {
    return await handleAiIntent(userId, intent.parsed, intent.command);
  }

  return '❓ I understood your request but couldn\'t take action.';
}