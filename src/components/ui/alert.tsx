import { AlertTriangle } from 'lucide-react';

export function Alert({ title, message }: { title: string; message: string }) {
  return (
    <div className="p-4 bg-gradient-to-r from-red-50 to-white border-l-4 border-red-400 text-red-800 rounded-xl shadow-lg flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 mt-0.5 text-red-500" />
      <div>
        <strong className="block font-semibold mb-1">{title}</strong>
        <p className="text-sm leading-snug text-gray-700">{message}</p>
      </div>
    </div>
  );
}