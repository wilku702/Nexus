import { useEffect } from 'react';
import { useCatalogStore } from '../../stores/useCatalogStore';
import { MOCK_TABLES, MOCK_TABLE_DETAIL } from '../../mocks/data';
import { TableList } from './TableList';
import { TableDetail } from './TableDetail';

export function CatalogBrowser() {
  const { tables, selectedTable, isLoadingList, isLoadingDetail, setTables, setSelectedTable, setLoadingList, setLoadingDetail } = useCatalogStore();

  useEffect(() => {
    setLoadingList(true);
    // Simulate API fetch
    setTimeout(() => {
      setTables(MOCK_TABLES);
      setLoadingList(false);
    }, 400);
  }, [setTables, setLoadingList]);

  const handleSelect = (name: string) => {
    setLoadingDetail(true);
    // Simulate API fetch
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
