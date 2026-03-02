interface TablesUsedPillProps {
  tables: string[];
}

export function TablesUsedPill({ tables }: TablesUsedPillProps) {
  if (tables.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] font-medium uppercase tracking-wider text-content-tertiary/60">
        via
      </span>
      <div className="flex flex-wrap gap-1">
        {tables.map((table) => (
          <span
            key={table}
            className="inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-mono font-medium text-content-tertiary bg-surface-tertiary"
          >
            {table}
          </span>
        ))}
      </div>
    </div>
  );
}
