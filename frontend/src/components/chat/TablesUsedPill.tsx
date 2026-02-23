interface TablesUsedPillProps {
  tables: string[];
}

export function TablesUsedPill({ tables }: TablesUsedPillProps) {
  if (tables.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {tables.map((table) => (
        <span
          key={table}
          className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600"
        >
          {table}
        </span>
      ))}
    </div>
  );
}
