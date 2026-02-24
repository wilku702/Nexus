import { Badge } from '../shared/Badge';

interface PiiBadgeProps {
  isPii: boolean;
}

export function PiiBadge({ isPii }: PiiBadgeProps) {
  if (!isPii) return null;
  return <Badge variant="tag-pii" label="PII" />;
}
