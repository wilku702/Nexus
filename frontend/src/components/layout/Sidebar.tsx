import { NavLink } from 'react-router-dom';
import { MessageSquare, Database, BarChart3, ClipboardList } from 'lucide-react';
import { clsx } from 'clsx';

const NAV_ITEMS = [
  { to: '/chat', label: 'Chat', icon: MessageSquare },
  { to: '/catalog', label: 'Catalog', icon: Database },
  { to: '/eval', label: 'Evaluations', icon: BarChart3 },
  { to: '/audit', label: 'Audit Log', icon: ClipboardList },
] as const;

export function Sidebar() {
  return (
    <aside className="flex w-60 flex-col bg-slate-900 text-slate-300">
      <div className="flex h-14 items-center px-5 border-b border-slate-700">
        <span className="text-lg font-bold text-white tracking-tight">NEXUS</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white',
              )
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
