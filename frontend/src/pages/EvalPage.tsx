import { PageWrapper } from '../components/layout/PageWrapper';
import { EvalDashboard } from '../components/eval/EvalDashboard';
import { RunEvalButton } from '../components/eval/RunEvalButton';
import { useEvalStore } from '../stores/useEvalStore';
import { MOCK_EVAL_REPORT } from '../mocks/data';

export function EvalPage() {
  const { isRunning, setRunning, setReport, setError } = useEvalStore();

  const handleRun = async () => {
    setRunning(true);
    setError(null);
    try {
      // TODO [WIRE-UP]: Replace mock delay with a real API call.
      // Endpoint: POST /api/evaluate
      // Request:  {} (empty body)
      // Response: { run_id, timestamp, summary, by_difficulty, test_cases }
      // Use: import { runEvaluation } from '../api/evaluate';
      //      const report = await runEvaluation();
      //      setReport(report);
      await new Promise((r) => setTimeout(r, 2000));
      setReport(MOCK_EVAL_REPORT);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Evaluation failed');
    } finally {
      setRunning(false);
    }
  };

  return (
    <PageWrapper
      title="Evaluations"
      action={<RunEvalButton onRun={handleRun} isRunning={isRunning} />}
    >
      <EvalDashboard />
    </PageWrapper>
  );
}
