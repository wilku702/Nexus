import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {icon && <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-secondary border border-border-primary text-content-tertiary">{icon}</div>}
      <h3 className="text-lg font-semibold text-content-primary">{title}</h3>
      {description && <p className="mt-1 text-sm text-content-secondary max-w-md">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
