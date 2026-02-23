import { clsx } from 'clsx';
import { Clock } from 'lucide-react';

interface LatencyBadgeProps {
  latencyMs: number;
}

export function LatencyBadge({ latencyMs }: LatencyBadgeProps) {
  const seconds = (latencyMs / 1000).toFixed(1);
  const color =
    latencyMs < 2000
      ? 'text-green-600'
      : latencyMs < 5000
        ? 'text-yellow-600'
        : 'text-red-600';

  return (
    <span className={clsx('inline-flex items-center gap-1 text-xs', color)}>
      <Clock className="h-3 w-3" />
      {seconds}s
    </span>
  );
}
