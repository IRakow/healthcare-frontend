export function EmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="text-center py-20 text-gray-500">
      <div className="text-6xl mb-4">🩺</div>
      <h2 className="text-xl font-semibold">{title}</h2>
      {subtitle && <p className="text-sm mt-1">{subtitle}</p>}
    </div>
  );
}