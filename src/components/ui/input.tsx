export function Input({ label, ...props }: any) {
  return (
    <div className="mb-4">
      {label && <label className="block text-sm font-medium mb-1 text-gray-700">{label}</label>}
      <input {...props} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur" />
    </div>
  );
}