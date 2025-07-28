export function redirectByRole(role: string): string {
  switch (role) {
    case 'admin':
      return '/admin/dashboard'
    case 'owner':
      return '/owner/dashboard'
    case 'provider':
      return '/provider/dashboard'
    case 'patient':
      return '/patient/dashboard'
    default:
      return '/login'
  }
}