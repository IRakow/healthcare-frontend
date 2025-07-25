interface Option {
  label: string;
  value: string;
}

interface SelectProps {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  options: Option[];
  disabled?: boolean;
  className?: string;
}

export default function Select({ label, value, onChange, options, disabled, className = '' }: SelectProps) {
  return (
    <div className={`mb-4 ${className}`}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}