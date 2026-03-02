import { useEffect } from 'react';
import { useEvalStore } from '../../stores/useEvalStore';
import { fetchEvalResults } from '../../api/evaluate';
import { EvalStatusBanner } from './EvalStatusBanner';
import { EvalSummaryCards } from './EvalSummaryCards';
import { DifficultyBreakdown } from './DifficultyBreakdown';
import { TestCaseTable } from './TestCaseTable';
import { EmptyState } from '../shared/EmptyState';
import { BarChart3 } from 'lucide-react';

export function EvalDashboard() {
  const { report, isRunning, error, setReport } = useEvalStore();

  useEffect(() => {
    fetchEvalResults()
      .then(setReport)
      .catch(() => {
        // 404 = no results yet, just show empty state
      });
  }, [setReport]);

  return (
    <div className="space-y-6">
      <EvalStatusBanner isRunning={isRunning} report={report} error={error} />

      {!report && !isRunning ? (
        <EmptyState
          icon={<BarChart3 className="h-12 w-12" />}
          title="No evaluation results"
          description="Run an evaluation to see how the agent performs against test cases."
        />
      ) : report ? (
        <>
          <EvalSummaryCards summary={report.summary} />
          <DifficultyBreakdown byDifficulty={report.by_difficulty} />
          <TestCaseTable testCases={report.test_cases} />
        </>
      ) : null}
    </div>
  );
}
