import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from 'recharts';
import type { Difficulty } from '../../types/common';
import type { DifficultyResult } from '../../types/api';
import { Card } from '../shared/Card';

interface DifficultyBreakdownProps {
  byDifficulty: Record<Difficulty, DifficultyResult>;
}

export function DifficultyBreakdown({ byDifficulty }: DifficultyBreakdownProps) {
  const data = (['easy', 'medium', 'hard'] as const).map((d) => ({
    name: d.charAt(0).toUpperCase() + d.slice(1),
    Passed: byDifficulty[d].passed,
    Failed: byDifficulty[d].total - byDifficulty[d].passed,
    pass_rate: byDifficulty[d].pass_rate,
  }));

  return (
    <Card title="Pass Rate by Difficulty">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="name" tick={{ fontSize: 13 }} />
          <YAxis tick={{ fontSize: 13 }} />
          <Tooltip />
          <Legend />
          <ReferenceLine y={0.8 * Math.max(...data.map((d) => d.Passed + d.Failed))} stroke="#f59e0b" strokeDasharray="6 3" label={{ value: '80% target', position: 'right', fontSize: 11, fill: '#f59e0b' }} />
          <Bar dataKey="Passed" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} />
          <Bar dataKey="Failed" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
