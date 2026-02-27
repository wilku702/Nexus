import { useEffect, useRef } from 'react';
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
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="w-full max-w-2xl rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 id="modal-title" className="text-lg font-semibold text-slate-900">Query Detail</h2>
          <button
            onClick={onClose}
            className="rounded p-1 hover:bg-slate-100"
            aria-label="Close modal"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div>
            <span className="text-xs font-medium text-slate-500">Question</span>
            <p className="mt-1 text-sm text-slate-800">{entry.original_question}</p>
          </div>

          <div>
            <span className="text-xs font-medium text-slate-500">Generated SQL</span>
            <div className="mt-1">
              <SqlBlock sql={entry.generated_sql} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-500">Role:</span>{' '}
              <Badge variant={`role-${entry.user_role}`} label={entry.user_role} />
            </div>
            <div>
              <span className="text-slate-500">Timestamp:</span>{' '}
              <span className="text-slate-800">{new Date(entry.timestamp).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-slate-500">PII Filtered:</span>{' '}
              <span className="text-slate-800">{entry.was_pii_filtered ? 'Yes' : 'No'}</span>
            </div>
            <div>
              <span className="text-slate-500">Rows:</span>{' '}
              <span className="text-slate-800">{entry.result_row_count}</span>
            </div>
            <div>
              <span className="text-slate-500">Latency:</span>{' '}
              <span className="text-slate-800">{(entry.latency_ms / 1000).toFixed(1)}s</span>
            </div>
            <div>
              <span className="text-slate-500">Model:</span>{' '}
              <span className="text-slate-800">{entry.llm_model_used}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 px-6 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
