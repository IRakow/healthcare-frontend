import { useNavigate, useLocation } from 'react-router-dom';
import { User, Stethoscope, ShieldCheck, Briefcase, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export function PanelSwitcher() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const panels = [
    {
      name: 'Owner Portal',
      icon: <Briefcase className="w-4 h-4" />,
      path: '/owner/dashboard',
      color: 'text-orange-600'
    },
    {
      name: 'Patient Portal',
      icon: <User className="w-4 h-4" />,
      path: '/patient/dashboard',
      color: 'text-blue-600'
    },
    {
      name: 'Provider Portal',
      icon: <Stethoscope className="w-4 h-4" />,
      path: '/provider/dashboard',
      color: 'text-green-600'
    },
    {
      name: 'Admin Portal',
      icon: <ShieldCheck className="w-4 h-4" />,
      path: '/admin/dashboard',
      color: 'text-purple-600'
    }
  ];

  const currentPanel = panels.find(p => location.pathname.startsWith(p.path.split('/')[1])) || panels[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <span className={currentPanel.color}>{currentPanel.icon}</span>
        <span className="font-medium text-gray-700">{currentPanel.name}</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="py-1">
            {panels.map((panel) => (
              <button
                key={panel.path}
                onClick={() => {
                  navigate(panel.path);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors ${
                  currentPanel.path === panel.path ? 'bg-gray-50' : ''
                }`}
              >
                <span className={panel.color}>{panel.icon}</span>
                <span className="text-gray-700">{panel.name}</span>
              </button>
            ))}
          </div>
          <div className="border-t border-gray-200 px-4 py-2">
            <p className="text-xs text-gray-500">Viewing as Owner</p>
          </div>
        </div>
      )}
    </div>
  );
}