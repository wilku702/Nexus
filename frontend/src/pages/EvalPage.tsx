import { PageWrapper } from '../components/layout/PageWrapper';
import { EvalDashboard } from '../components/eval/EvalDashboard';
import { RunEvalButton } from '../components/eval/RunEvalButton';
import { useEvalStore } from '../stores/useEvalStore';
import { runEvaluation } from '../api/evaluate';

export function EvalPage() {
  const { isRunning, report, setRunning, setReport, setError } = useEvalStore();

  const handleRun = async () => {
    setRunning(true);
    setError(null);
    try {
      const result = await runEvaluation();
      setReport(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Evaluation failed');
    } finally {
      setRunning(false);
    }
  };

  return (
    <PageWrapper
      title={
        <>
          Evaluations
          {report && !isRunning && (
            <span className="text-xs text-content-tertiary ml-3 font-normal">
              Last run: {new Date(report.timestamp).toLocaleString()}
            </span>
          )}
        </>
      }
      action={<RunEvalButton onRun={handleRun} isRunning={isRunning} />}
    >
      <EvalDashboard />
    </PageWrapper>
  );
}
