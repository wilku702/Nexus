import { clsx } from 'clsx';

export type BadgeVariant =
  | 'governance-public' | 'governance-internal' | 'governance-restricted'
  | 'tag-pii' | 'tag-sensitive' | 'tag-public'
  | 'status-healthy' | 'status-degraded' | 'status-down'
  | 'difficulty-easy' | 'difficulty-medium' | 'difficulty-hard'
  | 'role-analyst' | 'role-admin'
  | 'neutral';

interface BadgeProps {
  variant: BadgeVariant;
  label: string;
  size?: 'sm' | 'md';
}

const BADGE_CLASSES: Record<BadgeVariant, string> = {
  'governance-public':     'bg-green-100 text-green-800 border-green-200',
  'governance-internal':   'bg-blue-100 text-blue-800 border-blue-200',
  'governance-restricted': 'bg-red-100 text-red-800 border-red-200',
  'tag-pii':               'bg-red-50 text-red-700 border-red-200 font-semibold',
  'tag-sensitive':         'bg-orange-50 text-orange-700 border-orange-200',
  'tag-public':            'bg-green-50 text-green-700 border-green-200',
  'status-healthy':        'bg-green-100 text-green-800',
  'status-degraded':       'bg-yellow-100 text-yellow-800',
  'status-down':           'bg-red-100 text-red-800',
  'difficulty-easy':       'bg-green-50 text-green-700',
  'difficulty-medium':     'bg-yellow-50 text-yellow-700',
  'difficulty-hard':       'bg-red-50 text-red-700',
  'role-analyst':          'bg-purple-100 text-purple-800',
  'role-admin':            'bg-indigo-100 text-indigo-800',
  'neutral':               'bg-neutral-100 text-neutral-600',
};

export function Badge({ variant, label, size = 'sm' }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full border font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm',
        BADGE_CLASSES[variant],
      )}
    >
      {label}
    </span>
  );
}
