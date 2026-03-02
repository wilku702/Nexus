import { motion } from 'framer-motion';
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
    <motion.div
      key={table.table_name}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-content-primary">{table.table_name}</h2>
          <GovernanceBadge level={table.governance_level} />
        </div>
        <p className="mt-1 text-sm text-content-secondary">{table.description}</p>
        <p className="mt-1 text-xs text-content-tertiary">Owner: {table.owner}</p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border-primary">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-sidebar border-b border-border-primary">
              <th scope="col" className="px-4 py-3 text-left font-semibold text-content-secondary">Column</th>
              <th scope="col" className="px-4 py-3 text-left font-semibold text-content-secondary">Type</th>
              <th scope="col" className="px-4 py-3 text-left font-semibold text-content-secondary">Description</th>
              <th scope="col" className="px-4 py-3 text-left font-semibold text-content-secondary">PII</th>
              <th scope="col" className="px-4 py-3 text-left font-semibold text-content-secondary">Samples</th>
            </tr>
          </thead>
          <tbody>
            {table.columns.map((col) => (
              <ColumnRow key={col.column_name} column={col} />
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
