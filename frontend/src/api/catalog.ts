import { apiGet } from './client';
import type { TableSummary, TableDetail } from '../types/api';

export function fetchTables(): Promise<TableSummary[]> {
  return apiGet<TableSummary[]>('/catalog/tables');
}

export function fetchTableDetail(name: string): Promise<TableDetail> {
  return apiGet<TableDetail>(`/catalog/tables/${encodeURIComponent(name)}`);
}
