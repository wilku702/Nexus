export type UserRole = 'analyst' | 'admin';
export type GovernanceLevel = 'public' | 'internal' | 'restricted';
export type GovernanceTag = 'public' | 'pii' | 'sensitive';
export type HealthStatus = 'healthy' | 'degraded' | 'down';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type SortDirection = 'asc' | 'desc';

export interface SortConfig<T extends string = string> {
  column: T;
  direction: SortDirection;
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
}
