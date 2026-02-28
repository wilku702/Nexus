import { useEffect } from 'react';
import { useEvalStore } from '../../stores/useEvalStore';
import { MOCK_EVAL_REPORT } from '../../mocks/data';
import { EvalStatusBanner } from './EvalStatusBanner';
import { EvalSummaryCards } from './EvalSummaryCards';
import { DifficultyBreakdown } from './DifficultyBreakdown';
import { TestCaseTable } from './TestCaseTable';
import { EmptyState } from '../shared/EmptyState';
import { BarChart3 } from 'lucide-react';

export function EvalDashboard() {
  const { report, isRunning, error, setReport } = useEvalStore();

  useEffect(() => {
    // TODO [WIRE-UP]: Replace mock data with a real API call.
    // Endpoint: GET /api/evaluate/results
    // Response: { run_id, timestamp, summary, by_difficulty, test_cases }
    // Use: import { fetchEvalResults } from '../../api/evaluate';
    //      const report = await fetchEvalResults();
    //      setReport(report);
    setTimeout(() => {
      setReport(MOCK_EVAL_REPORT);
    }, 300);
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
