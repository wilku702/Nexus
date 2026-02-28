import { useEffect, useState, useMemo } from 'react';
import { useAuditStore } from '../../stores/useAuditStore';
import { MOCK_AUDIT_ENTRIES } from '../../mocks/data';
import { AuditFilters } from './AuditFilters';
import { AuditTable } from './AuditTable';
import { SqlPreviewModal } from './SqlPreviewModal';
import type { AuditLogEntry } from '../../types/api';

export function AuditLogViewer() {
  const {
    entries, filters, sort, pagination, isLoading,
    setEntries, setFilters, resetFilters, setSort, setPage, setLoading,
  } = useAuditStore();
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null);

  useEffect(() => {
    setLoading(true);
    // TODO [WIRE-UP]: Replace mock data with a real API call.
    // Endpoint: GET /api/audit
    // Response: [{ id, timestamp, user_role, original_question, generated_sql,
    //              was_pii_filtered, result_row_count, latency_ms, llm_model_used }, ...]
    // Use: import { fetchAuditLog } from '../../api/audit';
    //      const entries = await fetchAuditLog();
    //      setEntries(entries);
    setTimeout(() => {
      setEntries(MOCK_AUDIT_ENTRIES);
      setLoading(false);
    }, 400);
  }, [setEntries, setLoading]);

  const filteredAndSorted = useMemo(() => {
    let result = [...entries];

    // Apply filters
    if (filters.role !== 'all') {
      result = result.filter((e) => e.user_role === filters.role);
    }
    if (filters.piiFiltered !== null) {
      result = result.filter((e) => e.was_pii_filtered === filters.piiFiltered);
    }
    if (filters.dateFrom) {
      result = result.filter((e) => e.timestamp >= filters.dateFrom);
    }
    if (filters.dateTo) {
      const toEnd = filters.dateTo + 'T23:59:59Z';
      result = result.filter((e) => e.timestamp <= toEnd);
    }

    // Apply sort
    result.sort((a, b) => {
      const aVal = a[sort.column as keyof AuditLogEntry];
      const bVal = b[sort.column as keyof AuditLogEntry];
      if (aVal === bVal) return 0;
      const cmp = aVal < bVal ? -1 : 1;
      return sort.direction === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [entries, filters, sort]);

  const handleSort = (column: string) => {
    if (sort.column === column) {
      setSort({ column, direction: sort.direction === 'asc' ? 'desc' : 'asc' });
    } else {
      setSort({ column, direction: 'desc' });
    }
  };

  return (
    <div className="space-y-4">
      <AuditFilters filters={filters} onChange={setFilters} onReset={resetFilters} />
      <AuditTable
        entries={filteredAndSorted}
        sort={sort}
        onSort={handleSort}
        pagination={pagination}
        onPageChange={setPage}
        isLoading={isLoading}
        onRowClick={setSelectedEntry}
      />
      {selectedEntry && (
        <SqlPreviewModal entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
      )}
    </div>
  );
}
