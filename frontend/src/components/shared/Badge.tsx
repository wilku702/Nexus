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
  'governance-public':     'bg-green-500/15 text-green-400 border-green-800/30',
  'governance-internal':   'bg-blue-500/15 text-blue-400 border-blue-800/30',
  'governance-restricted': 'bg-red-500/15 text-red-400 border-red-800/30',
  'tag-pii':               'bg-red-500/15 text-red-400 border-red-800/30 font-semibold',
  'tag-sensitive':         'bg-orange-500/15 text-orange-400 border-orange-800/30',
  'tag-public':            'bg-green-500/15 text-green-400 border-green-800/30',
  'status-healthy':        'bg-green-500/15 text-green-400 border-green-800/30',
  'status-degraded':       'bg-yellow-500/15 text-yellow-400 border-yellow-800/30',
  'status-down':           'bg-red-500/15 text-red-400 border-red-800/30',
  'difficulty-easy':       'bg-green-500/15 text-green-400 border-green-800/30',
  'difficulty-medium':     'bg-yellow-500/15 text-yellow-400 border-yellow-800/30',
  'difficulty-hard':       'bg-red-500/15 text-red-400 border-red-800/30',
  'role-analyst':          'bg-purple-500/15 text-purple-400 border-purple-800/30',
  'role-admin':            'bg-indigo-500/15 text-indigo-400 border-indigo-800/30',
  'neutral':               'bg-neutral-500/15 text-neutral-400 border-neutral-700/30',
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
