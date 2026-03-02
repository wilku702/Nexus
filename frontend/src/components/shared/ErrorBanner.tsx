import { X, AlertCircle } from 'lucide-react';

interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
}

export function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  return (
    <div role="alert" aria-live="assertive" className="flex items-center gap-3 rounded-lg border border-red-800/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
      <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
      <span className="flex-1">{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="shrink-0 rounded p-1 hover:bg-red-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          aria-label="Dismiss error"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
