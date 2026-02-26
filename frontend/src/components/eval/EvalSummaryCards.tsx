import { Target, Clock, Shield, CheckCircle, XCircle, ListChecks } from 'lucide-react';
import { MetricCard } from '../shared/MetricCard';
import type { EvalSummary } from '../../types/api';

interface EvalSummaryCardsProps {
  summary: EvalSummary;
}

function getPassRateHighlight(rate: number) {
  if (rate >= 80) return 'success' as const;
  if (rate >= 60) return 'warning' as const;
  return 'danger' as const;
}

function getLatencyHighlight(ms: number) {
  if (ms < 2000) return 'success' as const;
  if (ms < 5000) return 'warning' as const;
  return 'danger' as const;
}

export function EvalSummaryCards({ summary }: EvalSummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
      <MetricCard
        label="Pass Rate"
        value={`${summary.pass_rate.toFixed(1)}%`}
        highlight={getPassRateHighlight(summary.pass_rate)}
        icon={<Target className="h-4 w-4" />}
      />
      <MetricCard
        label="Avg Latency"
        value={`${(summary.avg_latency_ms / 1000).toFixed(2)}s`}
        highlight={getLatencyHighlight(summary.avg_latency_ms)}
        icon={<Clock className="h-4 w-4" />}
      />
      <MetricCard
        label="Governance"
        value={`${summary.governance_compliance_rate.toFixed(0)}%`}
        highlight={summary.governance_compliance_rate === 100 ? 'success' : 'danger'}
        icon={<Shield className="h-4 w-4" />}
      />
      <MetricCard
        label="Total Tests"
        value={summary.total_tests}
        icon={<ListChecks className="h-4 w-4" />}
      />
      <MetricCard
        label="Passed"
        value={summary.passed}
        highlight="success"
        icon={<CheckCircle className="h-4 w-4" />}
      />
      <MetricCard
        label="Failed"
        value={summary.failed}
        highlight={summary.failed > 0 ? 'danger' : 'success'}
        icon={<XCircle className="h-4 w-4" />}
      />
    </div>
  );
}
