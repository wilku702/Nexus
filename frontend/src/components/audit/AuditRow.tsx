import { Lock, Minus } from 'lucide-react';
import { Badge } from '../shared/Badge';
import type { AuditLogEntry } from '../../types/api';
import type { BadgeVariant } from '../shared/Badge';

interface AuditRowProps {
  entry: AuditLogEntry;
  onClick: () => void;
}

export function AuditRow({ entry, onClick }: AuditRowProps) {
  return (
    <tr
      onClick={onClick}
      className="border-b border-border-secondary cursor-pointer hover:bg-accent/[0.03] transition-colors duration-100"
    >
      <td className="px-4 py-3 text-sm text-content-secondary whitespace-nowrap">
        {new Date(entry.timestamp).toLocaleString()}
      </td>
      <td className="px-4 py-3">
        <Badge variant={`role-${entry.user_role}` as BadgeVariant} label={entry.user_role} />
      </td>
      <td className="px-4 py-3 text-sm text-content-primary max-w-xs truncate">
        {entry.original_question}
      </td>
      <td className="px-4 py-3">
        {entry.was_pii_filtered ? (
          <Lock className="h-4 w-4 text-yellow-400" />
        ) : (
          <Minus className="h-4 w-4 text-content-tertiary" />
        )}
      </td>
      <td className="px-4 py-3 text-sm text-content-secondary">{entry.result_row_count}</td>
      <td className="px-4 py-3 text-sm text-content-secondary">{(entry.latency_ms / 1000).toFixed(1)}s</td>
      <td className="px-4 py-3 text-sm text-content-tertiary">{entry.llm_model_used}</td>
    </tr>
  );
}
