import { motion } from 'framer-motion';
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

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
};

export function EvalSummaryCards({ summary }: EvalSummaryCardsProps) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6"
    >
      <motion.div variants={item}>
        <MetricCard
          label="Pass Rate"
          value={`${summary.pass_rate.toFixed(1)}%`}
          highlight={getPassRateHighlight(summary.pass_rate)}
          icon={<Target className="h-4 w-4" />}
        />
      </motion.div>
      <motion.div variants={item}>
        <MetricCard
          label="Avg Latency"
          value={`${(summary.avg_latency_ms / 1000).toFixed(2)}s`}
          highlight={getLatencyHighlight(summary.avg_latency_ms)}
          icon={<Clock className="h-4 w-4" />}
        />
      </motion.div>
      <motion.div variants={item}>
        <MetricCard
          label="Governance"
          value={`${summary.governance_compliance_rate.toFixed(0)}%`}
          highlight={summary.governance_compliance_rate === 100 ? 'success' : 'danger'}
          icon={<Shield className="h-4 w-4" />}
        />
      </motion.div>
      <motion.div variants={item}>
        <MetricCard
          label="Total Tests"
          value={summary.total_tests}
          icon={<ListChecks className="h-4 w-4" />}
        />
      </motion.div>
      <motion.div variants={item}>
        <MetricCard
          label="Passed"
          value={summary.passed}
          highlight="success"
          icon={<CheckCircle className="h-4 w-4" />}
        />
      </motion.div>
      <motion.div variants={item}>
        <MetricCard
          label="Failed"
          value={summary.failed}
          highlight={summary.failed > 0 ? 'danger' : 'success'}
          icon={<XCircle className="h-4 w-4" />}
        />
      </motion.div>
    </motion.div>
  );
}
