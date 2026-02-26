import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import type { EvalReport } from '../../types/api';

interface EvalStatusBannerProps {
  isRunning: boolean;
  report: EvalReport | null;
  error: string | null;
}

export function EvalStatusBanner({ isRunning, report, error }: EvalStatusBannerProps) {
  if (error) {
    return (
      <div role="alert" className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-800">
        <AlertCircle className="h-4 w-4" />
        Evaluation failed: {error}
      </div>
    );
  }

  if (isRunning) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm text-blue-800">
        <Loader2 className="h-4 w-4 animate-spin" />
        Evaluation running — this may take 30-120 seconds...
      </div>
    );
  }

  if (report) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-800">
        <CheckCircle2 className="h-4 w-4" />
        Last run: {new Date(report.timestamp).toLocaleString()}
      </div>
    );
  }

  return null;
}
