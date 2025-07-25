import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export function MobileDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden fixed top-4 left-4 z-50">
      <button onClick={() => setOpen(!open)}>
        {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>
      {open && (
        <div className="absolute top-10 left-0 w-64 bg-white rounded-xl shadow-lg p-4 space-y-4">
          <Link to="/owner" onClick={() => setOpen(false)}>Dashboard</Link>
          <Link to="/owner/employers" onClick={() => setOpen(false)}>Employers</Link>
          <Link to="/owner/invoices" onClick={() => setOpen(false)}>Invoices</Link>
          <Link to="/owner/branding" onClick={() => setOpen(false)}>Branding</Link>
        </div>
      )}
    </div>
  );
}