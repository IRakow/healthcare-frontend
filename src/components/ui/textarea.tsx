export function Textarea({ label, ...props }: any) {
  return (
    <div className="mb-4">
      {label && <label className="block text-sm font-medium mb-1 text-gray-700">{label}</label>}
      <textarea {...props} className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/90 backdrop-blur" />
    </div>
  );
}