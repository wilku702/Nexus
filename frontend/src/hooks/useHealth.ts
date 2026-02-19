import { useEffect } from 'react';
import { useAppStore } from '../stores/useAppStore';
import { fetchHealth } from '../api/health';

export function useHealth(intervalMs = 30_000) {
  const setHealth = useAppStore((s) => s.setHealth);

  useEffect(() => {
    let mounted = true;

    const poll = async () => {
      try {
        const data = await fetchHealth();
        if (mounted) setHealth(data.status, data.database, data.llm);
      } catch {
        if (mounted) setHealth('down', 'unknown', 'unknown');
      }
    };

    poll();
    const id = setInterval(poll, intervalMs);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [intervalMs, setHealth]);
}
