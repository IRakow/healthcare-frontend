export function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-white/80 backdrop-blur p-6 shadow-xl hover:shadow-2xl transition-all">
      {title && <h4 className="font-semibold text-xl mb-3 text-gray-800 tracking-tight">{title}</h4>}
      {children}
    </div>
  );
}