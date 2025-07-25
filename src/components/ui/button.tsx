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