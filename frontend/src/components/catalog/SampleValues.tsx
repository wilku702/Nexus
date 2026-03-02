interface SampleValuesProps {
  values: string[];
}

export function SampleValues({ values }: SampleValuesProps) {
  const shown = values.slice(0, 3);

  if (shown.length === 0) return <span className="text-content-tertiary">—</span>;

  return (
    <div className="flex flex-wrap gap-1">
      {shown.map((v) => (
        <code key={v} className="rounded bg-white/[0.08] border border-border-secondary px-1.5 py-0.5 text-xs text-content-secondary font-mono">
          {v}
        </code>
      ))}
    </div>
  );
}
