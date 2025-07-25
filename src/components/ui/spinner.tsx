import { cn } from '@/lib/utils';

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'primary' | 'secondary' | 'white';
}

export function Spinner({ 
  className, 
  size = 'md', 
  variant = 'default',
  ...props 
}: SpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-8 w-8 border-3',
    xl: 'h-12 w-12 border-4'
  };

  const variantClasses = {
    default: 'border-gray-300 border-t-gray-600',
    primary: 'border-blue-200 border-t-blue-600',
    secondary: 'border-gray-200 border-t-gray-500',
    white: 'border-white/20 border-t-white'
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}

// Loading spinner with text
export function SpinnerWithText({ 
  text = 'Loading...', 
  size = 'md',
  variant = 'default',
  className 
}: SpinnerProps & { text?: string }) {
  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <Spinner size={size} variant={variant} />
      <p className="text-sm text-gray-500">{text}</p>
    </div>
  );
}

// Full page spinner
export function FullPageSpinner({ 
  text = 'Loading...',
  size = 'lg',
  variant = 'primary' 
}: SpinnerProps & { text?: string }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
      <SpinnerWithText text={text} size={size} variant={variant} />
    </div>
  );
}

// Inline spinner for buttons
export function ButtonSpinner({ className }: { className?: string }) {
  return (
    <Spinner 
      size="sm" 
      variant="white" 
      className={cn('mr-2', className)} 
    />
  );
}