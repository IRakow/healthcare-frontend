/**
 * Generate a Jitsi Meet link for a video appointment
 * @param apptId - The appointment ID
 * @returns The Jitsi Meet URL
 */
export function generateJitsiLink(apptId: string): string {
  return `https://meet.jit.si/purity-health-${apptId}`;
}

/**
 * Check if a video URL is a valid Jitsi link for this application
 * @param url - The URL to check
 * @returns Whether the URL is a valid Purity Health Jitsi link
 */
export function isValidJitsiLink(url: string): boolean {
  return url.startsWith('https://meet.jit.si/purity-health-');
}

/**
 * Extract appointment ID from a Jitsi link
 * @param url - The Jitsi Meet URL
 * @returns The appointment ID or null if invalid
 */
export function getAppointmentIdFromJitsiLink(url: string): string | null {
  const match = url.match(/^https:\/\/meet\.jit\.si\/purity-health-(.+)$/);
  return match ? match[1] : null;
}