import { create } from 'zustand';
import type { EvalReport } from '../types/api';

interface EvalState {
  report: EvalReport | null;
  isRunning: boolean;
  error: string | null;
  setReport: (report: EvalReport | null) => void;
  setRunning: (running: boolean) => void;
  setError: (error: string | null) => void;
}

export const useEvalStore = create<EvalState>()((set) => ({
  report: null,
  isRunning: false,
  error: null,
  setReport: (report) => set({ report, error: null }),
  setRunning: (running) => set({ isRunning: running }),
  setError: (error) => set({ error }),
}));
