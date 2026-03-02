import { Loader2, AlertCircle } from 'lucide-react';
import type { EvalReport } from '../../types/api';

interface EvalStatusBannerProps {
  isRunning: boolean;
  report: EvalReport | null;
  error: string | null;
}

export function EvalStatusBanner({ isRunning, error }: EvalStatusBannerProps) {
  if (error) {
    return (
      <div role="alert" className="flex items-center gap-2 rounded-lg border border-red-800/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
        <AlertCircle className="h-4 w-4" />
        Evaluation failed: {error}
      </div>
    );
  }

  if (isRunning) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-blue-800/30 bg-blue-500/10 px-4 py-2.5 text-sm text-blue-400">
        <Loader2 className="h-4 w-4 animate-spin" />
        Evaluation running — this may take 30-120 seconds...
      </div>
    );
  }

  return null;
}
