import { ChevronUp, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import type { SortConfig } from '../../types/common';
import type { ReactNode } from 'react';

export interface ColumnDef<T> {
  key: string;
  header: string;
  render?: (row: T) => ReactNode;
  sortable?: boolean;
  width?: string;
}

interface TableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  onSort?: (column: string) => void;
  sortConfig?: SortConfig;
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  rowKey: (row: T) => string | number;
}

export function Table<T>({
  columns,
  data,
  onSort,
  sortConfig,
  isLoading,
  emptyMessage = 'No data available',
  onRowClick,
  rowKey,
}: TableProps<T>) {
  if (isLoading) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-primary bg-surface-tertiary">
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 text-left font-semibold text-content-secondary" style={col.width ? { width: col.width } : undefined}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-border-secondary">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
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

  if (data.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-content-tertiary">{emptyMessage}</div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border-primary bg-surface-tertiary">
            {columns.map((col) => (
              <th
                key={col.key}
                className={clsx(
                  'px-4 py-3 text-left font-semibold text-content-secondary',
                  col.sortable && onSort && 'cursor-pointer select-none hover:text-content-primary',
                )}
                style={col.width ? { width: col.width } : undefined}
                onClick={col.sortable && onSort ? () => onSort(col.key) : undefined}
              >
                <span className="inline-flex items-center gap-1">
                  {col.header}
                  {col.sortable && sortConfig?.column === col.key && (
                    sortConfig.direction === 'asc' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={rowKey(row)}
              className={clsx(
                'border-b border-border-secondary even:bg-surface-tertiary/30',
                onRowClick && 'cursor-pointer hover:bg-surface-tertiary',
              )}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-content-primary">
                  {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
