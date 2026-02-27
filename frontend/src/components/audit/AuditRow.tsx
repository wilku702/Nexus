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
      className="border-b border-slate-100 cursor-pointer hover:bg-slate-50"
    >
      <td className="px-4 py-3 text-sm text-slate-600 whitespace-nowrap">
        {new Date(entry.timestamp).toLocaleString()}
      </td>
      <td className="px-4 py-3">
        <Badge variant={`role-${entry.user_role}` as BadgeVariant} label={entry.user_role} />
      </td>
      <td className="px-4 py-3 text-sm text-slate-800 max-w-xs truncate">
        {entry.original_question}
      </td>
      <td className="px-4 py-3">
        {entry.was_pii_filtered ? (
          <Lock className="h-4 w-4 text-amber-500" />
        ) : (
          <Minus className="h-4 w-4 text-slate-300" />
        )}
      </td>
      <td className="px-4 py-3 text-sm text-slate-600">{entry.result_row_count}</td>
      <td className="px-4 py-3 text-sm text-slate-600">{(entry.latency_ms / 1000).toFixed(1)}s</td>
      <td className="px-4 py-3 text-sm text-slate-500">{entry.llm_model_used}</td>
    </tr>
  );
}
