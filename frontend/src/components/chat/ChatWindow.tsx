import { useChatStore } from '../../stores/useChatStore';
import { useAppStore } from '../../stores/useAppStore';
import { sendChatMessage } from '../../api/chat';
import { MOCK_CHAT_RESPONSES, SUGGESTED_QUESTIONS } from '../../mocks/data';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { MessageSquare } from 'lucide-react';
import { EmptyState } from '../shared/EmptyState';

const USE_MOCKS = false;

export function ChatWindow() {
  const { messages, isLoading, addUserMessage, addAssistantMessage, addErrorMessage, setLoading } = useChatStore();
  const currentRole = useAppStore((s) => s.currentRole);

  const handleSubmit = async (question: string) => {
    addUserMessage(question);
    setLoading(true);

    try {
      // TODO [WIRE-UP]: Replace this entire mock block with a real API call.
      // When your backend is running, set USE_MOCKS = false (line 10) and
      // the else branch below will call your POST /api/chat endpoint.
      //
      // Endpoint: POST /api/chat
      // Request:  { question: string, role: 'analyst' | 'admin' }
      // Response: { answer: string, sql: string, tables_used: string[], latency_ms: number }
      //
      // The API client is already wired up in api/chat.ts — you just need
      // to flip USE_MOCKS to false once your backend returns valid responses.
      if (USE_MOCKS) {
        await new Promise((r) => setTimeout(r, 800));
        const mock = MOCK_CHAT_RESPONSES[question];
        if (mock) {
          addAssistantMessage(mock.answer, mock);
        } else {
          addAssistantMessage(
            `I found results for your query: "${question}"`,
            {
              answer: `I found results for your query: "${question}"`,
              sql: `-- Generated SQL for: ${question}\nSELECT * FROM table LIMIT 10;`,
              tables_used: ['Customer', 'Invoice'],
              latency_ms: Math.floor(Math.random() * 2000) + 500,
            },
          );
        }
      } else {
        const response = await sendChatMessage({ question, role: currentRole });
        addAssistantMessage(response.answer, response);
      }
    } catch (err) {
      addErrorMessage(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      {currentRole === 'analyst' ? (
        <div className="border-b border-yellow-200 bg-yellow-50 px-4 py-2 text-xs text-yellow-800">
          Analyst mode — PII columns will be masked in results
        </div>
      ) : (
        <div className="border-b border-blue-200 bg-blue-50 px-4 py-2 text-xs text-blue-800">
          Admin mode — Full access enabled
        </div>
      )}

      {messages.length === 0 && !isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <EmptyState
              icon={<MessageSquare className="h-12 w-12" />}
              title="Ask anything about your data"
              description="Powered by the Chinook music database"
            />
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSubmit(q)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 hover:border-blue-300 hover:text-blue-600 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <MessageList messages={messages} isLoading={isLoading} />
      )}

      <ChatInput onSubmit={handleSubmit} isDisabled={isLoading} />
    </div>
  );
}
