import { clsx } from 'clsx';
import type { ReactNode } from 'react';

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Card({ title, children, className }: CardProps) {
  return (
    <div className={clsx('bg-white rounded-lg border border-slate-200 shadow-sm', className)}>
      {title && (
        <div className="px-5 py-3 border-b border-slate-200">
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
