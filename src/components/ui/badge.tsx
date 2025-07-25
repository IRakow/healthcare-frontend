export function Badge({ label, color = 'blue' }: { label: string; color?: string }) {
  return (
    <span className={`inline-block text-xs font-semibold bg-${color}-100 text-${color}-700 px-3 py-1 rounded-full shadow-sm tracking-wide`}>{label}</span>
  );
}