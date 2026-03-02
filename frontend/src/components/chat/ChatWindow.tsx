import { useChatStore } from '../../stores/useChatStore';
import { useAppStore } from '../../stores/useAppStore';
import { sendChatMessage } from '../../api/chat';
import { MOCK_CHAT_RESPONSES, SUGGESTED_QUESTIONS } from '../../mocks/data';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';

const USE_MOCKS = false;

export function ChatWindow() {
  const { messages, isLoading, addUserMessage, addAssistantMessage, addErrorMessage, setLoading } = useChatStore();
  const currentRole = useAppStore((s) => s.currentRole);

  const handleSubmit = async (question: string) => {
    addUserMessage(question);
    setLoading(true);

    try {
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
      {messages.length === 0 && !isLoading ? (
        <div className="flex flex-1 flex-col items-center justify-end pb-8 px-4">
          {/* Greeting section — positioned toward bottom by justify-end */}
          <div className="mb-8 text-center">
            <div className="mb-3 flex items-center justify-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/15 text-accent text-sm font-bold ring-1 ring-accent/20">
                N
              </span>
              <span className="text-xs font-medium uppercase tracking-widest text-content-tertiary">
                Nexus
              </span>
            </div>
            <h2 className="text-xl font-semibold text-content-primary">
              Ask anything about your data
            </h2>
            <p className="mt-1.5 text-sm text-content-tertiary">
              Powered by the Chinook music database
            </p>
          </div>

          {/* Suggestion chips — 2x2 grid cards */}
          <div className="mb-4 grid grid-cols-2 gap-2 w-full max-w-lg">
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button
                key={q}
                onClick={() => handleSubmit(q)}
                className="group relative flex items-start gap-2.5 rounded-xl border border-border-primary bg-surface-secondary px-3.5 py-3 text-left text-xs text-content-secondary transition-all duration-150 hover:border-accent/30 hover:bg-surface-tertiary hover:text-content-primary hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
              >
                <span className="mt-0.5 text-[10px] font-mono text-content-tertiary/60 shrink-0">
                  0{i + 1}
                </span>
                <span className="leading-relaxed">{q}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <MessageList messages={messages} isLoading={isLoading} currentRole={currentRole} />
      )}

      <ChatInput onSubmit={handleSubmit} isDisabled={isLoading} />
    </div>
  );
}
