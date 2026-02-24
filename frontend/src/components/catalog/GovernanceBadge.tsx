import { Badge } from '../shared/Badge';
import type { GovernanceLevel } from '../../types/common';

interface GovernanceBadgeProps {
  level: GovernanceLevel;
}

export function GovernanceBadge({ level }: GovernanceBadgeProps) {
  return <Badge variant={`governance-${level}`} label={level} />;
}
