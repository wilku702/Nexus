import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';
import type { AuditLogEntry } from '../../types/api';
import type { SortConfig, PaginationConfig } from '../../types/common';
import { AuditRow } from './AuditRow';

interface AuditTableProps {
  entries: AuditLogEntry[];
  sort: SortConfig;
  onSort: (column: string) => void;
  pagination: PaginationConfig;
  onPageChange: (page: number) => void;
  isLoading: boolean;
  onRowClick: (entry: AuditLogEntry) => void;
}

const COLUMNS = [
  { key: 'timestamp', label: 'Timestamp', sortable: true },
  { key: 'user_role', label: 'Role', sortable: true },
  { key: 'original_question', label: 'Question', sortable: false },
  { key: 'was_pii_filtered', label: 'PII', sortable: true },
  { key: 'result_row_count', label: 'Rows', sortable: true },
  { key: 'latency_ms', label: 'Latency', sortable: true },
  { key: 'llm_model_used', label: 'Model', sortable: false },
] as const;

export function AuditTable({ entries, sort, onSort, pagination, onPageChange, isLoading, onRowClick }: AuditTableProps) {
  const totalPages = Math.max(1, Math.ceil(entries.length / pagination.pageSize));
  const start = (pagination.page - 1) * pagination.pageSize;
  const paged = entries.slice(start, start + pagination.pageSize);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border-primary bg-surface-secondary overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-tertiary border-b border-border-primary">
              {COLUMNS.map((c) => (
                <th key={c.key} className="px-4 py-3 text-left font-semibold text-content-secondary">{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-border-secondary">
                {COLUMNS.map((c) => (
                  <td key={c.key} className="px-4 py-3">
                    <div className="h-4 w-3/4 rounded skeleton-shimmer" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border-primary bg-surface-secondary overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-surface-tertiary border-b border-border-primary">
            {COLUMNS.map((c) => (
              <th
                key={c.key}
                className={`px-4 py-3 text-left font-semibold text-content-secondary ${c.sortable ? 'cursor-pointer select-none hover:text-content-primary' : ''}`}
                onClick={c.sortable ? () => onSort(c.key) : undefined}
              >
                <span className={`inline-flex items-center gap-1 ${c.sortable && sort.column === c.key ? 'text-accent' : ''}`}>
                  {c.label}
                  {c.sortable && sort.column === c.key && (
                    sort.direction === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paged.map((entry) => (
            <AuditRow key={entry.id} entry={entry} onClick={() => onRowClick(entry)} />
          ))}
        </tbody>
      </table>

      <div className="flex items-center justify-between border-t border-border-primary px-4 py-3">
        <span className="text-sm text-content-tertiary">
          Showing {start + 1}–{Math.min(start + pagination.pageSize, entries.length)} of {entries.length} entries
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="rounded p-1 text-content-secondary hover:bg-surface-tertiary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm text-content-secondary">
            Page {pagination.page} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= totalPages}
            className="rounded p-1 text-content-secondary hover:bg-surface-tertiary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
