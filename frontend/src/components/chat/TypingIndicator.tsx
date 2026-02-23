export function TypingIndicator() {
  return (
    <div role="status" aria-live="polite" className="flex items-center gap-1 px-4 py-3">
      <span className="text-sm text-slate-500">Thinking</span>
      <span className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="inline-block h-1.5 w-1.5 rounded-full bg-slate-400"
            style={{
              animation: 'typing-dot 1.4s infinite ease-in-out',
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </span>
    </div>
  );
}
