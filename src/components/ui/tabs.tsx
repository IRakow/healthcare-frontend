export function Tabs({ tabs, active, onSelect }: any) {
  return (
    <div className="flex border-b border-gray-200 mb-4 overflow-x-auto">
      {tabs.map((tab: string) => (
        <button
          key={tab}
          onClick={() => onSelect(tab)}
          className={`whitespace-nowrap px-4 py-2 text-sm font-medium border-b-2 transition-colors ${active === tab ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-blue-500 hover:border-blue-300'}`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}