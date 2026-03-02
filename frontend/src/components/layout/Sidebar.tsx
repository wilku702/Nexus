import { NavLink, useLocation } from 'react-router-dom';
import { MessageSquare, Database, BarChart3, ClipboardList } from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

const NAV_ITEMS = [
  { to: '/chat', label: 'Chat', icon: MessageSquare },
  { to: '/catalog', label: 'Catalog', icon: Database },
  { to: '/eval', label: 'Evaluations', icon: BarChart3 },
  { to: '/audit', label: 'Audit Log', icon: ClipboardList },
] as const;

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="sidebar-gradient flex w-60 flex-col bg-surface-sidebar text-content-secondary">
      <div className="flex h-14 items-center px-5 border-b border-border-primary">
        <span className="text-lg font-bold text-accent tracking-tight">NEXUS</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
          const isActive = location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              className={clsx(
                'relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200',
                isActive
                  ? 'text-content-primary'
                  : 'text-content-secondary hover:bg-surface-secondary hover:text-content-primary',
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-lg bg-accent/10 border-l-2 border-l-accent"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
              <Icon className="relative h-5 w-5" />
              <span className="relative">{label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
