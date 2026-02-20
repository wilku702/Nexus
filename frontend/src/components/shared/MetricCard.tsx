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
  success: 'border-green-200 bg-green-50',
  warning: 'border-yellow-200 bg-yellow-50',
  danger: 'border-red-200 bg-red-50',
  neutral: 'border-slate-200 bg-white',
} as const;

const VALUE_CLASSES = {
  success: 'text-green-700',
  warning: 'text-yellow-700',
  danger: 'text-red-700',
  neutral: 'text-slate-900',
} as const;

export function MetricCard({ label, value, subtext, highlight = 'neutral', icon }: MetricCardProps) {
  return (
    <div className={clsx('rounded-lg border p-4 shadow-sm', HIGHLIGHT_CLASSES[highlight])}>
      <div className="flex items-center gap-2">
        {icon && <span className="text-slate-500">{icon}</span>}
        <span className="text-sm font-medium text-slate-600">{label}</span>
      </div>
      <div className={clsx('mt-1 text-2xl font-bold', VALUE_CLASSES[highlight])}>
        {value}
      </div>
      {subtext && <p className="mt-0.5 text-xs text-slate-500">{subtext}</p>}
    </div>
  );
}
