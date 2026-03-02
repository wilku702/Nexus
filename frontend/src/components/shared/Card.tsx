import { clsx } from 'clsx';
import type { ReactNode } from 'react';

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Card({ title, children, className }: CardProps) {
  return (
    <div className={clsx('bg-surface-secondary rounded-lg border border-border-primary shadow-black/20', className)}>
      {title && (
        <div className="px-5 py-3 border-b border-border-primary">
          <h3 className="text-sm font-semibold text-content-primary">{title}</h3>
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
