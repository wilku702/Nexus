import { create } from 'zustand';
import type { AuditLogEntry } from '../types/api';
import type { AuditFilters } from '../types/store';
import type { SortConfig, PaginationConfig } from '../types/common';

interface AuditState {
  entries: AuditLogEntry[];
  filters: AuditFilters;
  sort: SortConfig;
  pagination: PaginationConfig;
  isLoading: boolean;
  setEntries: (entries: AuditLogEntry[]) => void;
  setFilters: (filters: Partial<AuditFilters>) => void;
  resetFilters: () => void;
  setSort: (sort: SortConfig) => void;
  setPage: (page: number) => void;
  setLoading: (loading: boolean) => void;
}

const DEFAULT_FILTERS: AuditFilters = {
  role: 'all',
  piiFiltered: null,
  dateFrom: '',
  dateTo: '',
};

export const useAuditStore = create<AuditState>()((set) => ({
  entries: [],
  filters: { ...DEFAULT_FILTERS },
  sort: { column: 'timestamp', direction: 'desc' },
  pagination: { page: 1, pageSize: 25 },
  isLoading: false,
  setEntries: (entries) => set({ entries }),
  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
      pagination: { ...state.pagination, page: 1 },
    })),
  resetFilters: () =>
    set({ filters: { ...DEFAULT_FILTERS }, pagination: { page: 1, pageSize: 25 } }),
  setSort: (sort) => set({ sort }),
  setPage: (page) => set((state) => ({ pagination: { ...state.pagination, page } })),
  setLoading: (loading) => set({ isLoading: loading }),
}));
