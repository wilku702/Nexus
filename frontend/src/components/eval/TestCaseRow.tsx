import { CheckCircle, XCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '../shared/Badge';
import { SqlBlock } from '../chat/SqlBlock';
import type { TestCaseResult } from '../../types/api';
import type { BadgeVariant } from '../shared/Badge';

interface TestCaseRowProps {
  testCase: TestCaseResult;
  isExpanded: boolean;
  onToggle: () => void;
}

export function TestCaseRow({ testCase, isExpanded, onToggle }: TestCaseRowProps) {
  return (
    <>
      <tr
        onClick={onToggle}
        className="border-b border-border-secondary cursor-pointer hover:bg-surface-tertiary"
      >
        <td className="px-4 py-3">
          {testCase.passed ? (
            <CheckCircle className="h-4 w-4 text-green-400" />
          ) : (
            <XCircle className="h-4 w-4 text-red-400" />
          )}
        </td>
        <td className="px-4 py-3">
          <Badge variant={`difficulty-${testCase.difficulty}` as BadgeVariant} label={testCase.difficulty} />
        </td>
        <td className="px-4 py-3 text-sm text-content-primary">{testCase.question}</td>
        <td className="px-4 py-3 text-sm text-content-secondary">{(testCase.latency_ms / 1000).toFixed(1)}s</td>
        <td className="px-4 py-3 text-sm text-content-secondary">{(testCase.sql_accuracy * 100).toFixed(0)}%</td>
        <td className="px-4 py-3">
          {isExpanded ? <ChevronDown className="h-4 w-4 text-content-tertiary" /> : <ChevronRight className="h-4 w-4 text-content-tertiary" />}
        </td>
      </tr>
      <AnimatePresence>
        {isExpanded && (
          <tr className="border-b border-border-secondary">
            <td colSpan={6} className="p-0">
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="bg-surface-tertiary px-8 py-4 space-y-3">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-content-tertiary">SQL Accuracy: </span>
                      <span className="font-medium text-content-primary">{(testCase.sql_accuracy * 100).toFixed(0)}%</span>
                    </div>
                    <div>
                      <span className="text-content-tertiary">Answer Accuracy: </span>
                      <span className="font-medium text-content-primary">{(testCase.answer_accuracy * 100).toFixed(0)}%</span>
                    </div>
                    <div>
                      <span className="text-content-tertiary">Governance: </span>
                      <span className="font-medium text-content-primary">{testCase.governance_compliant ? 'Compliant' : 'Non-compliant'}</span>
                    </div>
                  </div>
                  <SqlBlock sql={testCase.generated_sql} />
                </div>
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
}
