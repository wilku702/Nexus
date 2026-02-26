import { Play } from 'lucide-react';
import { Button } from '../shared/Button';
import { LoadingSpinner } from '../shared/LoadingSpinner';

interface RunEvalButtonProps {
  onRun: () => void;
  isRunning: boolean;
}

export function RunEvalButton({ onRun, isRunning }: RunEvalButtonProps) {
  return (
    <Button onClick={onRun} disabled={isRunning}>
      {isRunning ? (
        <>
          <LoadingSpinner size="sm" className="text-white" />
          Running...
        </>
      ) : (
        <>
          <Play className="h-4 w-4" />
          Run Evaluation
        </>
      )}
    </Button>
  );
}
