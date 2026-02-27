import type { AuditFilters as AuditFiltersType } from '../../types/store';
import { Button } from '../shared/Button';
import { RotateCcw } from 'lucide-react';

interface AuditFiltersProps {
  filters: AuditFiltersType;
  onChange: (filters: Partial<AuditFiltersType>) => void;
  onReset: () => void;
}

export function AuditFilters({ filters, onChange, onReset }: AuditFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-4 rounded-lg border border-slate-200 bg-white p-4">
      <div>
        <label htmlFor="filter-role" className="block text-xs font-medium text-slate-600 mb-1">Role</label>
        <select
          id="filter-role"
          value={filters.role}
          onChange={(e) => onChange({ role: e.target.value as AuditFiltersType['role'] })}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
        >
          <option value="all">All</option>
          <option value="analyst">Analyst</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div>
        <label htmlFor="filter-from" className="block text-xs font-medium text-slate-600 mb-1">From</label>
        <input
          id="filter-from"
          type="date"
          value={filters.dateFrom}
          onChange={(e) => onChange({ dateFrom: e.target.value })}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
        />
      </div>

      <div>
        <label htmlFor="filter-to" className="block text-xs font-medium text-slate-600 mb-1">To</label>
        <input
          id="filter-to"
          type="date"
          value={filters.dateTo}
          onChange={(e) => onChange({ dateTo: e.target.value })}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
        />
      </div>

      <div>
        <label htmlFor="filter-pii" className="block text-xs font-medium text-slate-600 mb-1">PII Filtered</label>
        <select
          id="filter-pii"
          value={filters.piiFiltered === null ? 'any' : filters.piiFiltered ? 'yes' : 'no'}
          onChange={(e) => {
            const v = e.target.value;
            onChange({ piiFiltered: v === 'any' ? null : v === 'yes' });
          }}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
        >
          <option value="any">Any</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>

      <Button variant="ghost" size="sm" onClick={onReset}>
        <RotateCcw className="h-3.5 w-3.5" />
        Reset
      </Button>
    </div>
  );
}
