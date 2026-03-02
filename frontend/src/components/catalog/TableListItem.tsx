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
        'w-full text-left px-4 py-3 border-b border-border-secondary transition-all duration-200',
        isSelected
          ? 'bg-accent-muted border-l-[3px] border-l-accent'
          : 'hover:bg-surface-tertiary hover:border-l-accent/30 border-l-[3px] border-l-transparent',
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-semibold text-sm text-content-primary">{table.table_name}</span>
        <GovernanceBadge level={table.governance_level} />
      </div>
      <p className="mt-0.5 text-xs text-content-secondary truncate">{table.description}</p>
      <span className="mt-1 text-xs text-content-tertiary">{table.column_count} columns</span>
    </button>
  );
}
