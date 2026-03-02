import { useAppStore } from '../../stores/useAppStore';
import { Badge } from '../shared/Badge';
import type { UserRole } from '../../types/common';

function StatusDot({ connected, label }: { connected: boolean; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="relative flex h-2 w-2">
        <span
          className={`absolute inset-0 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}
        />
        {connected && (
          <span className="absolute inset-0 rounded-full bg-green-500 animate-glow-pulse" />
        )}
      </span>
      <span className="text-xs text-content-tertiary">{label}</span>
    </div>
  );
}

export function Header() {
  const { currentRole, setRole, healthStatus, databaseStatus, llmStatus } = useAppStore();

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRole(e.target.value as UserRole);
  };

  return (
    <header className="flex h-14 items-center justify-between border-b border-border-primary bg-surface-secondary px-6">
      <div className="text-sm font-semibold text-content-primary">Data Catalog Agent</div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <StatusDot connected={databaseStatus === 'connected'} label="DB" />
          <StatusDot connected={llmStatus === 'connected'} label="LLM" />
          {healthStatus !== 'healthy' && (
            <Badge
              variant={healthStatus === 'degraded' ? 'status-degraded' : 'status-down'}
              label={healthStatus}
            />
          )}
        </div>

        <div className="h-5 w-px bg-border-primary" />

        <div className="flex items-center gap-2">
          <label htmlFor="role-select" className="text-xs text-content-tertiary">
            Role:
          </label>
          <select
            id="role-select"
            value={currentRole}
            onChange={handleRoleChange}
            className="rounded-md border border-border-primary bg-surface-tertiary px-2.5 py-1 text-sm font-medium text-content-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <option value="analyst">Analyst</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>
    </header>
  );
}
