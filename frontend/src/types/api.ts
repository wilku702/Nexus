import type { GovernanceLevel, GovernanceTag, HealthStatus, Difficulty, UserRole } from './common';

// -- Chat --

export interface ChatRequest {
  question: string;
  role: UserRole;
}

export interface ChatResponse {
  answer: string;
  sql: string;
  tables_used: string[];
  latency_ms: number;
}

// -- Catalog --

export interface TableSummary {
  table_name: string;
  description: string;
  owner: string;
  governance_level: GovernanceLevel;
  column_count: number;
}

export interface ColumnMetadata {
  column_name: string;
  data_type: string;
  description: string;
  is_pii: boolean;
  sample_values: string[];
  governance_tag: GovernanceTag;
}

export interface TableDetail extends TableSummary {
  columns: ColumnMetadata[];
}

// -- Health --

export interface HealthResponse {
  status: HealthStatus;
  database: string;
  llm: string;
}

// -- Audit --

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user_role: UserRole;
  original_question: string;
  generated_sql: string;
  was_pii_filtered: boolean;
  result_row_count: number;
  latency_ms: number;
  llm_model_used: string;
}

// -- Evaluate --

export interface EvalSummary {
  total_tests: number;
  passed: number;
  failed: number;
  pass_rate: number;
  avg_latency_ms: number;
  governance_compliance_rate: number;
}

export interface DifficultyResult {
  total: number;
  passed: number;
  pass_rate: number;
}

export interface TestCaseResult {
  question: string;
  difficulty: Difficulty;
  generated_sql: string;
  sql_correct: boolean;
  sql_accuracy: number;
  answer_accuracy: number;
  latency_ms: number;
  governance_compliant: boolean;
  passed: boolean;
}

export interface EvalReport {
  run_id: string;
  timestamp: string;
  summary: EvalSummary;
  by_difficulty: Record<Difficulty, DifficultyResult>;
  test_cases: TestCaseResult[];
}

// -- Errors --

export interface ApiError {
  status: number;
  message: string;
  detail?: string;
}
