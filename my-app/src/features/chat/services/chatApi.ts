import { apiClient } from '../../../services/apiClient';
import { endpoints } from '../../../services/endpoints';
import type { Message } from '../types';
export const askGemini = (messages: Message[], signal: AbortSignal) =>
  apiClient<{ reply: string }>(endpoints.chat, {
    method: 'POST',
    body: JSON.stringify({ messages }),
    signal,
  });
