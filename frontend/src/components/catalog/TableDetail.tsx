import type { TableDetail as TableDetailType } from '../../types/api';
import { GovernanceBadge } from './GovernanceBadge';
import { ColumnRow } from './ColumnRow';
import { Database } from 'lucide-react';
import { EmptyState } from '../shared/EmptyState';
import { LoadingSpinner } from '../shared/LoadingSpinner';

interface TableDetailProps {
  table: TableDetailType | null;
  isLoading: boolean;
}

export function TableDetail({ table, isLoading }: TableDetailProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!table) {
    return (
      <EmptyState
        icon={<Database className="h-12 w-12" />}
        title="Select a table to view its schema"
        description="Choose a table from the list to see column details and governance information."
      />
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-slate-900">{table.table_name}</h2>
          <GovernanceBadge level={table.governance_level} />
        </div>
        <p className="mt-1 text-sm text-slate-600">{table.description}</p>
        <p className="mt-1 text-xs text-slate-400">Owner: {table.owner}</p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-600">Column</th>
              <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-600">Type</th>
              <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-600">Description</th>
              <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-600">PII</th>
              <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-600">Samples</th>
            </tr>
          </thead>
          <tbody>
            {table.columns.map((col) => (
              <ColumnRow key={col.column_name} column={col} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
