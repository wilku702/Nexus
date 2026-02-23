import type { ChatMessage } from '../../types/store';
import { UserMessage } from './UserMessage';
import { AssistantMessage } from './AssistantMessage';
import { TypingIndicator } from './TypingIndicator';
import { useAutoScroll } from '../../hooks/useAutoScroll';

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const scrollRef = useAutoScroll([messages.length, isLoading]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
      {messages.map((msg) =>
        msg.role === 'user' ? (
          <UserMessage key={msg.id} content={msg.content} />
        ) : (
          <AssistantMessage
            key={msg.id}
            content={msg.content}
            response={msg.response}
            isError={msg.isError}
          />
        ),
      )}
      {isLoading && <TypingIndicator />}
    </div>
  );
}
