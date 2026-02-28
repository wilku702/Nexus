import { useEffect } from 'react';
import { useCatalogStore } from '../../stores/useCatalogStore';
import { MOCK_TABLES, MOCK_TABLE_DETAIL } from '../../mocks/data';
import { TableList } from './TableList';
import { TableDetail } from './TableDetail';

export function CatalogBrowser() {
  const { tables, selectedTable, isLoadingList, isLoadingDetail, setTables, setSelectedTable, setLoadingList, setLoadingDetail } = useCatalogStore();

  useEffect(() => {
    setLoadingList(true);
    // TODO [WIRE-UP]: Replace mock data with a real API call.
    // Endpoint: GET /api/catalog/tables
    // Response: [{ table_name, description, owner, governance_level, column_count }, ...]
    // Use: import { fetchTables } from '../../api/catalog';
    //      const tables = await fetchTables();
    //      setTables(tables);
    setTimeout(() => {
      setTables(MOCK_TABLES);
      setLoadingList(false);
    }, 400);
  }, [setTables, setLoadingList]);

  const handleSelect = (name: string) => {
    setLoadingDetail(true);
    // TODO [WIRE-UP]: Replace mock data with a real API call.
    // Endpoint: GET /api/catalog/tables/:name
    // Response: { table_name, description, owner, governance_level, column_count, columns: [...] }
    // Use: import { fetchTableDetail } from '../../api/catalog';
    //      const detail = await fetchTableDetail(name);
    //      setSelectedTable(detail);
    setTimeout(() => {
      setSelectedTable(MOCK_TABLE_DETAIL[name] ?? null);
      setLoadingDetail(false);
    }, 300);
  };

  return (
    <div className="grid h-[calc(100vh-theme(spacing.14)-theme(spacing.20))] grid-cols-[320px_1fr]">
      <div className="border-r border-slate-200 overflow-y-auto bg-white">
        <TableList
          tables={tables}
          selectedTableName={selectedTable?.table_name ?? null}
          onSelect={handleSelect}
          isLoading={isLoadingList}
        />
      </div>
      <div className="overflow-y-auto p-6">
        <TableDetail table={selectedTable} isLoading={isLoadingDetail} />
      </div>
    </div>
  );
}
