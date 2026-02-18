import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserRole, HealthStatus } from '../types/common';

interface AppState {
  currentRole: UserRole;
  healthStatus: HealthStatus;
  databaseStatus: string;
  llmStatus: string;
  setRole: (role: UserRole) => void;
  setHealth: (status: HealthStatus, database: string, llm: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentRole: 'analyst',
      healthStatus: 'healthy',
      databaseStatus: 'connected',
      llmStatus: 'connected',
      setRole: (role) => set({ currentRole: role }),
      setHealth: (status, database, llm) =>
        set({ healthStatus: status, databaseStatus: database, llmStatus: llm }),
    }),
    {
      name: 'nexus-app-store',
      partialize: (state) => ({ currentRole: state.currentRole }),
    },
  ),
);
