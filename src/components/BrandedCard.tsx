import { useBranding } from '@/hooks/useBranding';

interface BrandedCardProps {
  children: React.ReactNode;
  className?: string;
}

export function BrandedCard({ children, className = '' }: BrandedCardProps) {
  const branding = useBranding();
  const accentColor = branding?.primary_color || '#3B82F6';

  return (
    <div 
      style={{ borderColor: accentColor }} 
      className={`rounded-lg border-2 p-4 ${className}`}
    >
      {children}
    </div>
  );
}

// Example usage with dynamic button styling
export function BrandedButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  const branding = useBranding();
  const accentColor = branding?.primary_color || '#3B82F6';

  return (
    <button
      style={{ backgroundColor: accentColor }}
      className="text-white px-4 py-2 rounded hover:opacity-90 transition-opacity"
      onClick={onClick}
    >
      {children}
    </button>
  );
}

// Example usage with branded header
export function BrandedHeader() {
  const branding = useBranding();
  const accentColor = branding?.primary_color || '#3B82F6';

  return (
    <header className="p-4 border-b">
      <div className="flex items-center justify-between">
        {branding?.logo_url ? (
          <img src={branding.logo_url} alt="Logo" className="h-8" />
        ) : (
          <h1 style={{ color: accentColor }} className="text-xl font-bold">
            Insperity Health
          </h1>
        )}
        {branding?.tagline && (
          <p className="text-sm text-gray-600">{branding.tagline}</p>
        )}
      </div>
    </header>
  );
}