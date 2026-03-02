import { useState, useRef, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatInputProps {
  onSubmit: (message: string) => void;
  isDisabled: boolean;
}

export function ChatInput({ onSubmit, isDisabled }: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Auto-grow: resize textarea to fit content, cap at 200px
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [value]);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || isDisabled) return;
    onSubmit(trimmed);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const hasText = value.trim().length > 0;

  return (
    <div className="border-t border-border-primary bg-surface-primary px-4 pb-5 pt-3">
      <div className="mx-auto max-w-3xl">
        <div
          className={`flex items-end gap-2 rounded-2xl border bg-surface-secondary px-4 py-3 transition-all duration-200 ${
            isDisabled
              ? 'border-border-primary opacity-70'
              : hasText
                ? 'border-accent/40 shadow-[0_0_0_1px_rgba(212,165,116,0.12),0_4px_16px_rgba(0,0,0,0.3)]'
                : 'border-border-primary hover:border-border-primary/80 focus-within:border-accent/30 focus-within:shadow-[0_4px_16px_rgba(0,0,0,0.25)]'
          }`}
        >
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your data..."
            rows={1}
            disabled={isDisabled}
            className="flex-1 resize-none bg-transparent text-sm leading-relaxed text-content-primary placeholder:text-content-tertiary focus-visible:outline-none focus-visible:ring-0 disabled:opacity-50 max-h-[200px] overflow-y-auto"
            style={{ height: 'auto' }}
          />
          <button
            onClick={handleSubmit}
            disabled={isDisabled || !hasText}
            aria-label="Send message"
            className={`flex-shrink-0 mb-0.5 rounded-lg p-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-1 focus-visible:ring-offset-surface-secondary ${
              hasText && !isDisabled
                ? 'bg-accent text-surface-primary hover:bg-accent-hover hover:shadow-[0_0_10px_rgba(212,165,116,0.25)] active:scale-95 opacity-100'
                : 'bg-surface-tertiary text-content-tertiary opacity-0 pointer-events-none'
            }`}
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
        <AnimatePresence>
          {hasText && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="mt-1.5 text-center text-[11px] text-content-tertiary/60"
            >
              Shift + Enter for new line
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
