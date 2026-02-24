import type { TableSummary } from '../../types/api';
import { TableListItem } from './TableListItem';

interface TableListProps {
  tables: TableSummary[];
  selectedTableName: string | null;
  onSelect: (name: string) => void;
  isLoading: boolean;
}

export function TableList({ tables, selectedTableName, onSelect, isLoading }: TableListProps) {
  if (isLoading) {
    return (
      <div className="space-y-1 p-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-lg px-4 py-3 space-y-2">
            <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
            <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-y-auto">
      {tables.map((table) => (
        <TableListItem
          key={table.table_name}
          table={table}
          isSelected={selectedTableName === table.table_name}
          onClick={() => onSelect(table.table_name)}
        />
      ))}
    </div>
  );
}
