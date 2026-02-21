import type { ReactNode } from 'react';

interface PageWrapperProps {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}

export function PageWrapper({ title, action, children }: PageWrapperProps) {
  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {action}
      </div>
      {children}
    </div>
  );
}
