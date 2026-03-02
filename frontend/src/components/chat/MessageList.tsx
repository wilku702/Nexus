import { motion } from 'framer-motion';
import type { ChatMessage } from '../../types/store';
import type { UserRole } from '../../types/common';
import { UserMessage } from './UserMessage';
import { AssistantMessage } from './AssistantMessage';
import { TypingIndicator } from './TypingIndicator';
import { useAutoScroll } from '../../hooks/useAutoScroll';

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  currentRole: UserRole;
}

export function MessageList({ messages, isLoading, currentRole }: MessageListProps) {
  const scrollRef = useAutoScroll([messages.length, isLoading]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Role mode indicator — subtle centered pill */}
        {messages.length > 0 && (
          <div className="flex justify-center">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                currentRole === 'analyst'
                  ? 'border-yellow-500/20 bg-yellow-500/5 text-yellow-400/70'
                  : 'border-blue-500/20 bg-blue-500/5 text-blue-400/70'
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {currentRole === 'analyst' ? 'PII masked' : 'Full access'}
            </span>
          </div>
        )}

        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {msg.role === 'user' ? (
              <UserMessage content={msg.content} />
            ) : (
              <AssistantMessage
                content={msg.content}
                response={msg.response}
                isError={msg.isError}
              />
            )}
          </motion.div>
        ))}
        {isLoading && <TypingIndicator />}
      </div>
    </div>
  );
}
