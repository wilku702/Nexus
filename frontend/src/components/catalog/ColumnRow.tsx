import type { ColumnMetadata } from '../../types/api';
import { PiiBadge } from './PiiBadge';
import { SampleValues } from './SampleValues';
import { clsx } from 'clsx';

interface ColumnRowProps {
  column: ColumnMetadata;
}

export function ColumnRow({ column }: ColumnRowProps) {
  return (
    <tr className={clsx('border-b border-slate-100', column.is_pii && 'border-l-[3px] border-l-rose-400')}>
      <td className="px-4 py-2.5 font-mono text-sm text-slate-800">{column.column_name}</td>
      <td className="px-4 py-2.5 text-sm text-slate-600">{column.data_type}</td>
      <td className="px-4 py-2.5 text-sm text-slate-600">{column.description}</td>
      <td className="px-4 py-2.5"><PiiBadge isPii={column.is_pii} /></td>
      <td className="px-4 py-2.5"><SampleValues values={column.sample_values} /></td>
    </tr>
  );
}
