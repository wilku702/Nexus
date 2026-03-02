import { motion } from 'framer-motion';

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      role="status"
      aria-live="polite"
      aria-label="Nexus is thinking"
      className="flex items-start gap-3"
    >
      {/* Avatar matches AssistantMessage */}
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent text-xs font-bold ring-1 ring-accent/20">
        N
      </span>

      <div className="flex items-center gap-1 py-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="inline-block h-2 w-2 rounded-full bg-content-tertiary"
            style={{
              animation: 'typing-dot 1.4s infinite ease-in-out',
              animationDelay: `${i * 0.16}s`,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}
