import { clsx } from 'clsx';
import { Clock } from 'lucide-react';

interface LatencyBadgeProps {
  latencyMs: number;
}

export function LatencyBadge({ latencyMs }: LatencyBadgeProps) {
  const seconds = (latencyMs / 1000).toFixed(1);

  const colorClass =
    latencyMs < 2000
      ? 'text-content-tertiary'
      : latencyMs < 5000
        ? 'text-yellow-400/50'
        : 'text-red-400/60';

  return (
    <span
      className={clsx('inline-flex items-center gap-1 text-[11px]', colorClass)}
      title={`Query executed in ${latencyMs}ms`}
    >
      <Clock className="h-3 w-3" />
      {seconds}s
    </span>
  );
}
