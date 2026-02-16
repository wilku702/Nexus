import { apiGet } from './client';
import type { AuditLogEntry } from '../types/api';

export function fetchAuditLog(): Promise<AuditLogEntry[]> {
  return apiGet<AuditLogEntry[]>('/audit');
}
