import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { ChatResponse } from '../../types/api';
import { SqlBlock } from './SqlBlock';
import { TablesUsedPill } from './TablesUsedPill';
import { LatencyBadge } from './LatencyBadge';

interface AssistantMessageProps {
  content: string;
  response?: ChatResponse;
  isError?: boolean;
}

export function AssistantMessage({ content, response, isError }: AssistantMessageProps) {
  const [showSql, setShowSql] = useState(false);

  return (
    <div className="flex justify-start">
      <div className={`max-w-[85%] rounded-lg border shadow-sm ${isError ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-white'}`}>
        <div className="px-4 py-3 text-sm text-slate-800 whitespace-pre-wrap">{content}</div>

        {response && (
          <div className="border-t border-slate-100 px-4 py-2.5 space-y-2">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSql(!showSql)}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors"
              >
                {showSql ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                {showSql ? 'Hide SQL' : 'Show SQL'}
              </button>
              <TablesUsedPill tables={response.tables_used} />
              <LatencyBadge latencyMs={response.latency_ms} />
            </div>

            {showSql && (
              <div className="mt-2">
                <SqlBlock sql={response.sql} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
