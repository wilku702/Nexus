import { useState } from 'react';
import type { TestCaseResult } from '../../types/api';
import { TestCaseRow } from './TestCaseRow';
import { Card } from '../shared/Card';

interface TestCaseTableProps {
  testCases: TestCaseResult[];
}

export function TestCaseTable({ testCases }: TestCaseTableProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <Card title="Test Cases">
      <div className="overflow-x-auto -m-5">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-600 w-10">Result</th>
              <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-600 w-24">Difficulty</th>
              <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-600">Question</th>
              <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-600 w-20">Latency</th>
              <th scope="col" className="px-4 py-3 text-left font-semibold text-slate-600 w-24">SQL Acc.</th>
              <th scope="col" className="px-4 py-3 w-8"></th>
            </tr>
          </thead>
          <tbody>
            {testCases.map((tc, i) => (
              <TestCaseRow
                key={tc.question}
                testCase={tc}
                isExpanded={expandedIndex === i}
                onToggle={() => setExpandedIndex(expandedIndex === i ? null : i)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
