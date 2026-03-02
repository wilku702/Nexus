import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { AuditLogEntry } from '../../types/api';
import { SqlBlock } from '../chat/SqlBlock';
import { Badge } from '../shared/Badge';

interface SqlPreviewModalProps {
  entry: AuditLogEntry;
  onClose: () => void;
}

export function SqlPreviewModal({ entry, onClose }: SqlPreviewModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <motion.div
      ref={overlayRef}
      onClick={handleOverlayClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="w-full max-w-2xl rounded-xl bg-surface-secondary/90 backdrop-blur-xl border border-white/5 shadow-2xl shadow-black/40"
      >
        <div className="flex items-center justify-between border-b border-border-primary px-6 py-4">
          <h2 id="modal-title" className="text-lg font-semibold text-content-primary">Query Detail</h2>
          <button
            onClick={onClose}
            className="rounded p-1 hover:bg-surface-tertiary"
            aria-label="Close modal"
          >
            <X className="h-5 w-5 text-content-tertiary" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div>
            <span className="text-xs font-medium text-content-tertiary">Question</span>
            <p className="mt-1 text-sm text-content-primary">{entry.original_question}</p>
          </div>

          <div>
            <span className="text-xs font-medium text-content-tertiary">Generated SQL</span>
            <div className="mt-1">
              <SqlBlock sql={entry.generated_sql} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-content-tertiary">Role:</span>{' '}
              <Badge variant={`role-${entry.user_role}`} label={entry.user_role} />
            </div>
            <div>
              <span className="text-content-tertiary">Timestamp:</span>{' '}
              <span className="text-content-primary">{new Date(entry.timestamp).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-content-tertiary">PII Filtered:</span>{' '}
              <span className="text-content-primary">{entry.was_pii_filtered ? 'Yes' : 'No'}</span>
            </div>
            <div>
              <span className="text-content-tertiary">Rows:</span>{' '}
              <span className="text-content-primary">{entry.result_row_count}</span>
            </div>
            <div>
              <span className="text-content-tertiary">Latency:</span>{' '}
              <span className="text-content-primary">{(entry.latency_ms / 1000).toFixed(1)}s</span>
            </div>
            <div>
              <span className="text-content-tertiary">Model:</span>{' '}
              <span className="text-content-primary">{entry.llm_model_used}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-border-primary px-6 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-surface-tertiary px-4 py-2 text-sm font-medium text-content-primary hover:bg-surface-tertiary/80"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
