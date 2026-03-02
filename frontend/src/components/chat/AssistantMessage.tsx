import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChatResponse } from '../../types/api';
import { SqlBlock } from './SqlBlock';
import { TablesUsedPill } from './TablesUsedPill';
import { LatencyBadge } from './LatencyBadge';
import { FormattedText } from './FormattedText';

interface AssistantMessageProps {
  content: string;
  response?: ChatResponse;
  isError?: boolean;
}

export function AssistantMessage({ content, response, isError }: AssistantMessageProps) {
  const [showSql, setShowSql] = useState(false);

  // Strip leading "**Answer:** " prefix if backend sends it
  const displayContent = content.replace(/^\*{1,2}Answer:\*{1,2}\s*/i, '');

  return (
    <div className="flex items-start gap-3">
      {/* Avatar — always visible, anchors the left edge */}
      <span
        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
          isError
            ? 'bg-red-500/15 text-red-400 ring-1 ring-red-500/20'
            : 'bg-accent/15 text-accent ring-1 ring-accent/20'
        }`}
      >
        N
      </span>

      {/* Message body — NO card border, just text on the surface */}
      <div className="flex-1 min-w-0 space-y-3">
        <p
          className={`text-sm leading-relaxed whitespace-pre-wrap ${
            isError ? 'text-red-400' : 'text-content-primary'
          }`}
        >
          <FormattedText text={displayContent} />
        </p>

        {/* Metadata footer — only when response data is present */}
        {response && (
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
              <button
                onClick={() => setShowSql(!showSql)}
                className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[11px] transition-colors duration-150 ${
                  showSql
                    ? 'bg-accent/10 text-accent'
                    : 'bg-surface-tertiary text-content-tertiary hover:text-content-secondary'
                }`}
              >
                {showSql ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                SQL
              </button>

              <span className="h-1 w-1 rounded-full bg-border-primary" />

              <TablesUsedPill tables={response.tables_used} />

              <span className="h-1 w-1 rounded-full bg-border-primary" />

              <LatencyBadge latencyMs={response.latency_ms} />
            </div>

            <AnimatePresence>
              {showSql && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <SqlBlock sql={response.sql} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
