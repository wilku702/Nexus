import { useAppStore } from '../../stores/useAppStore';
import { Badge } from '../shared/Badge';
import type { UserRole } from '../../types/common';

export function Header() {
  const { currentRole, setRole, healthStatus, databaseStatus, llmStatus } = useAppStore();

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRole(e.target.value as UserRole);
  };

  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div className="text-sm font-medium text-slate-500">Data Catalog Agent</div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span
              className={`h-2 w-2 rounded-full ${
                databaseStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
              }`}
              aria-label={`Database: ${databaseStatus}`}
            />
            <span className="text-xs text-slate-500">DB</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className={`h-2 w-2 rounded-full ${
                llmStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
              }`}
              aria-label={`LLM: ${llmStatus}`}
            />
            <span className="text-xs text-slate-500">LLM</span>
          </div>
          {healthStatus !== 'healthy' && (
            <Badge
              variant={healthStatus === 'degraded' ? 'status-degraded' : 'status-down'}
              label={healthStatus}
            />
          )}
        </div>

        <div className="h-5 w-px bg-slate-200" />

        <div className="flex items-center gap-2">
          <label htmlFor="role-select" className="text-xs text-slate-500">
            Role:
          </label>
          <select
            id="role-select"
            value={currentRole}
            onChange={handleRoleChange}
            className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-sm font-medium text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <option value="analyst">Analyst</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>
    </header>
  );
}
