import { apiGet, apiPost } from './client';
import type { EvalReport } from '../types/api';

export function runEvaluation(): Promise<EvalReport> {
  return apiPost<Record<string, never>, EvalReport>('/evaluate', {});
}

export function fetchEvalResults(): Promise<EvalReport> {
  return apiGet<EvalReport>('/evaluate/results');
}
