import { CheckCircle, XCircle, ChevronDown, ChevronRight } from 'lucide-react';
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
        className="border-b border-slate-100 cursor-pointer hover:bg-slate-50"
      >
        <td className="px-4 py-3">
          {testCase.passed ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <XCircle className="h-4 w-4 text-red-600" />
          )}
        </td>
        <td className="px-4 py-3">
          <Badge variant={`difficulty-${testCase.difficulty}` as BadgeVariant} label={testCase.difficulty} />
        </td>
        <td className="px-4 py-3 text-sm text-slate-800">{testCase.question}</td>
        <td className="px-4 py-3 text-sm text-slate-600">{(testCase.latency_ms / 1000).toFixed(1)}s</td>
        <td className="px-4 py-3 text-sm text-slate-600">{(testCase.sql_accuracy * 100).toFixed(0)}%</td>
        <td className="px-4 py-3">
          {isExpanded ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
        </td>
      </tr>
      {isExpanded && (
        <tr className="border-b border-slate-100 bg-slate-50">
          <td colSpan={6} className="px-8 py-4">
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">SQL Accuracy: </span>
                  <span className="font-medium">{(testCase.sql_accuracy * 100).toFixed(0)}%</span>
                </div>
                <div>
                  <span className="text-slate-500">Answer Accuracy: </span>
                  <span className="font-medium">{(testCase.answer_accuracy * 100).toFixed(0)}%</span>
                </div>
                <div>
                  <span className="text-slate-500">Governance: </span>
                  <span className="font-medium">{testCase.governance_compliant ? 'Compliant' : 'Non-compliant'}</span>
                </div>
              </div>
              <SqlBlock sql={testCase.generated_sql} />
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
