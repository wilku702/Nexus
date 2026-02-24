interface SampleValuesProps {
  values: string[];
}

export function SampleValues({ values }: SampleValuesProps) {
  const shown = values.slice(0, 3);

  if (shown.length === 0) return <span className="text-slate-400">—</span>;

  return (
    <div className="flex flex-wrap gap-1">
      {shown.map((v) => (
        <code key={v} className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600 font-mono">
          {v}
        </code>
      ))}
    </div>
  );
}
