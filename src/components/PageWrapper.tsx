export function PageWrapper({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="p-6 max-w-screen-xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-blue-700">{title}</h1>
      {children}
    </div>
  );
}