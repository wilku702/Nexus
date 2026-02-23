import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';

interface SqlBlockProps {
  sql: string;
}

export function SqlBlock({ sql }: SqlBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative rounded-lg overflow-hidden">
      <button
        onClick={handleCopy}
        className="absolute right-2 top-2 z-10 rounded p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
        aria-label={copied ? 'Copied' : 'Copy SQL'}
      >
        {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
      </button>
      <SyntaxHighlighter
        language="sql"
        style={vscDarkPlus}
        customStyle={{ margin: 0, borderRadius: '0.5rem', fontSize: '0.8125rem', maxHeight: '200px' }}
      >
        {sql}
      </SyntaxHighlighter>
    </div>
  );
}
