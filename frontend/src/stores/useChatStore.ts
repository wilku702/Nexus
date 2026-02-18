import { create } from 'zustand';
import type { ChatMessage } from '../types/store';
import type { ChatResponse } from '../types/api';

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  addUserMessage: (content: string) => void;
  addAssistantMessage: (content: string, response: ChatResponse) => void;
  addErrorMessage: (content: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearMessages: () => void;
}

let messageCounter = 0;

export const useChatStore = create<ChatState>()((set) => ({
  messages: [],
  isLoading: false,
  error: null,
  addUserMessage: (content) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: `msg-${++messageCounter}`,
          role: 'user',
          content,
          timestamp: Date.now(),
        },
      ],
      error: null,
    })),
  addAssistantMessage: (content, response) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: `msg-${++messageCounter}`,
          role: 'assistant',
          content,
          timestamp: Date.now(),
          response,
        },
      ],
    })),
  addErrorMessage: (content) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: `msg-${++messageCounter}`,
          role: 'assistant',
          content,
          timestamp: Date.now(),
          isError: true,
        },
      ],
    })),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearMessages: () => set({ messages: [], error: null }),
}));
