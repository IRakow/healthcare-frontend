import { cn } from '@/lib/utils';

export function buttonVariants({ variant = 'default', size = 'default', className = '' }: {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
} = {}) {
  const base = 'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
  
  const variants = {
    default: 'bg-gray-900 text-gray-50 hover:bg-gray-900/90',
    destructive: 'bg-red-500 text-gray-50 hover:bg-red-500/90',
    outline: 'border border-gray-200 bg-white hover:bg-gray-100 hover:text-gray-900',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-100/80',
    ghost: 'hover:bg-gray-100 hover:text-gray-900',
    link: 'text-gray-900 underline-offset-4 hover:underline',
  };

  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-11 rounded-md px-8',
    icon: 'h-10 w-10',
  };

  return cn(base, variants[variant], sizes[size], className);
}

export function Button({ children, onClick, type = 'button', variant = 'primary', className = '', ...props }: any) {
  const base = 'px-5 py-2 rounded-xl text-sm shadow-md transition-all font-medium';

  const styles = {
    primary: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:brightness-110',
    secondary: 'bg-white border text-gray-800 hover:bg-gray-100',
    danger: 'bg-red-500 text-white hover:bg-red-600',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${base} ${styles[variant] || styles.primary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}