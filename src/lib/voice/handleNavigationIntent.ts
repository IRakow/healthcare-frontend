import { speak } from './RachelTTSQueue';

export async function handleNavigationIntent(command: string) {
  const nav = {
    audit: '/admin/audit',
    invoices: '/admin/invoices',
    settings: '/admin/settings',
    users: '/admin/users',
    employers: '/admin/employers',
    analytics: '/admin/analytics',
    backup: '/admin/backup',
    broadcast: '/admin/broadcast'
  };

  const match = Object.entries(nav).find(([key]) => command.includes(key));
  if (!match) {
    return speak("I don't recognize that section.");
  }

  const path = match[1];
  window.history.pushState({}, '', path);
  speak(`Navigating to ${match[0]} section.`);
  return true;
}