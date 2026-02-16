import { apiPost } from './client';
import type { ChatRequest, ChatResponse } from '../types/api';

export function sendChatMessage(req: ChatRequest): Promise<ChatResponse> {
  return apiPost<ChatRequest, ChatResponse>('/chat', req);
}
