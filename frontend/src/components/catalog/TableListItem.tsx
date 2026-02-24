import { clsx } from 'clsx';
import type { TableSummary } from '../../types/api';
import { GovernanceBadge } from './GovernanceBadge';

interface TableListItemProps {
  table: TableSummary;
  isSelected: boolean;
  onClick: () => void;
}

export function TableListItem({ table, isSelected, onClick }: TableListItemProps) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full text-left px-4 py-3 border-b border-slate-100 transition-colors',
        isSelected
          ? 'bg-blue-50 border-l-[3px] border-l-blue-600'
          : 'hover:bg-slate-50 border-l-[3px] border-l-transparent',
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-semibold text-sm text-slate-900">{table.table_name}</span>
        <GovernanceBadge level={table.governance_level} />
      </div>
      <p className="mt-0.5 text-xs text-slate-500 truncate">{table.description}</p>
      <span className="mt-1 text-xs text-slate-400">{table.column_count} columns</span>
    </button>
  );
}
