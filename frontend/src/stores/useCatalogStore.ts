import { create } from 'zustand';
import type { TableSummary, TableDetail } from '../types/api';

interface CatalogState {
  tables: TableSummary[];
  selectedTable: TableDetail | null;
  isLoadingList: boolean;
  isLoadingDetail: boolean;
  setTables: (tables: TableSummary[]) => void;
  setSelectedTable: (table: TableDetail | null) => void;
  setLoadingList: (loading: boolean) => void;
  setLoadingDetail: (loading: boolean) => void;
}

export const useCatalogStore = create<CatalogState>()((set) => ({
  tables: [],
  selectedTable: null,
  isLoadingList: false,
  isLoadingDetail: false,
  setTables: (tables) => set({ tables }),
  setSelectedTable: (table) => set({ selectedTable: table }),
  setLoadingList: (loading) => set({ isLoadingList: loading }),
  setLoadingDetail: (loading) => set({ isLoadingDetail: loading }),
}));
