/**
 * Lightweight inline markdown renderer.
 * Handles **bold**, `inline code`, and preserves whitespace.
 * No external dependencies — just regex splitting.
 */

interface FormattedTextProps {
  text: string;
}

export function FormattedText({ text }: FormattedTextProps) {
  // Split on **bold** and `code` patterns (non-greedy)
  const parts = text.split(/(\*\*[^*]+?\*\*|`[^`]+?`)/g);

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={i} className="font-semibold text-content-primary">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith('`') && part.endsWith('`')) {
          return (
            <code
              key={i}
              className="rounded bg-surface-tertiary px-1.5 py-0.5 text-[13px] font-mono text-accent"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}
