import type { UserRole } from './common';
import type { ChatResponse } from './api';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  response?: ChatResponse;
  isError?: boolean;
}

export interface AuditFilters {
  role: UserRole | 'all';
  piiFiltered: boolean | null;
  dateFrom: string;
  dateTo: string;
}
