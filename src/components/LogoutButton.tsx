import { logout } from '@/utils/logout';

interface LogoutButtonProps {
  className?: string;
  variant?: 'default' | 'small';
}

export default function LogoutButton({ className = '', variant = 'default' }: LogoutButtonProps) {
  const handleLogout = async () => {
    await logout();
  };

  const baseClasses = variant === 'small' 
    ? 'px-3 py-1 text-sm' 
    : 'px-4 py-2';

  return (
    <button
      onClick={handleLogout}
      className={`${baseClasses} bg-red-500 hover:bg-red-600 text-white rounded transition-colors ${className}`}
    >
      Logout
    </button>
  );
}