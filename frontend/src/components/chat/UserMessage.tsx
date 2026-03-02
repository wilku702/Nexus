import { motion } from 'framer-motion';

interface UserMessageProps {
  content: string;
}

export function UserMessage({ content }: UserMessageProps) {
  return (
    <div className="flex justify-end">
      <motion.div
        initial={{ opacity: 0, y: 6, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="max-w-[70%] rounded-2xl rounded-br-sm bg-surface-tertiary px-4 py-2.5 text-sm text-content-primary ring-1 ring-border-primary/50"
      >
        {content}
      </motion.div>
    </div>
  );
}
