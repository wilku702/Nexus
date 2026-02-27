import { ChevronLeft, ChevronRight } from 'lucide-react';
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
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {COLUMNS.map((c) => (
                <th key={c.key} className="px-4 py-3 text-left font-semibold text-slate-600">{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-slate-100">
                {COLUMNS.map((c) => (
                  <td key={c.key} className="px-4 py-3">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
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
    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            {COLUMNS.map((c) => (
              <th
                key={c.key}
                className={`px-4 py-3 text-left font-semibold text-slate-600 ${c.sortable ? 'cursor-pointer select-none hover:text-slate-900' : ''}`}
                onClick={c.sortable ? () => onSort(c.key) : undefined}
              >
                <span className="inline-flex items-center gap-1">
                  {c.label}
                  {c.sortable && sort.column === c.key && (
                    <span className="text-xs">{sort.direction === 'asc' ? '\u25B2' : '\u25BC'}</span>
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

      <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
        <span className="text-sm text-slate-500">
          Showing {start + 1}–{Math.min(start + pagination.pageSize, entries.length)} of {entries.length} entries
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="rounded p-1 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm text-slate-600">
            Page {pagination.page} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= totalPages}
            className="rounded p-1 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
