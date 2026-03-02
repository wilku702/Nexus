import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface PageWrapperProps {
  title: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}

export function PageWrapper({ title, action, children }: PageWrapperProps) {
  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-content-primary">{title}</h1>
        {action}
      </div>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    </div>
  );
}
