import { clsx } from 'clsx';
import type { ReactNode } from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  highlight?: 'success' | 'warning' | 'danger' | 'neutral';
  icon?: ReactNode;
}

const HIGHLIGHT_CLASSES = {
  success: 'bg-surface-secondary border-border-primary border-t-2 border-t-green-500/60',
  warning: 'bg-surface-secondary border-border-primary border-t-2 border-t-yellow-500/60',
  danger: 'bg-surface-secondary border-border-primary border-t-2 border-t-red-500/60',
  neutral: 'border-border-primary bg-surface-secondary',
} as const;

const VALUE_CLASSES = {
  success: 'text-green-400',
  warning: 'text-yellow-400',
  danger: 'text-red-400',
  neutral: 'text-content-primary',
} as const;

export function MetricCard({ label, value, subtext, highlight = 'neutral', icon }: MetricCardProps) {
  return (
    <div className={clsx('rounded-lg border p-4 transition-all duration-200 hover:shadow-md hover:shadow-black/20', HIGHLIGHT_CLASSES[highlight])}>
      <div className="flex items-center gap-2">
        {icon && <span className="text-content-tertiary">{icon}</span>}
        <span className="text-sm font-medium text-content-secondary">{label}</span>
      </div>
      <div className={clsx('mt-2 text-3xl font-bold', VALUE_CLASSES[highlight])}>
        {value}
      </div>
      {subtext && <p className="mt-0.5 text-xs text-content-tertiary">{subtext}</p>}
    </div>
  );
}
